const listWorkflowRunsForRepo = jest.fn();
const deleteWorkflowRun = jest.fn();
const paginate = jest.fn();
const getInput = jest.fn();
const getBooleanInput = jest.fn();
const setFailed = jest.fn();
const info = jest.fn();

jest.mock('@actions/core', () => ({
  getInput,
  getBooleanInput,
  setFailed,
  info,
}));

jest.mock('@actions/github', () => ({
  getOctokit: jest.fn(() => ({
    paginate,
    rest: {
      actions: {
        listWorkflowRunsForRepo,
        deleteWorkflowRun,
      },
    },
  })),
  context: { repo: { owner: 'test-owner', repo: 'test-repo' } },
}));

import { deleteWorkflowRuns, filterRuns, getWorkflowRuns, groupRunsByWorkflow, run } from '../src/index';

describe('groupRunsByWorkflow', () => {
  it('groups runs correctly by workflow_id', () => {
    const mockRuns = [
      { id: 1, created_at: '2024-02-01T00:00:00Z', workflow_id: 100 },
      { id: 2, created_at: '2024-02-02T00:00:00Z', workflow_id: 200 },
      { id: 3, created_at: '2024-02-03T00:00:00Z', workflow_id: 100 },
    ];

    const result = groupRunsByWorkflow(mockRuns);
    expect(result).toEqual({
      '100': [
        { id: 1, created_at: '2024-02-01T00:00:00Z', workflow_id: 100 },
        { id: 3, created_at: '2024-02-03T00:00:00Z', workflow_id: 100 },
      ],
      '200': [{ id: 2, created_at: '2024-02-02T00:00:00Z', workflow_id: 200 }],
    });
  });
});

describe('filterRuns', () => {
  const mockRuns = [
    { id: 1, created_at: '2024-02-01T00:00:00Z', workflow_id: 100 },
    { id: 2, created_at: '2024-02-02T00:00:00Z', workflow_id: 100 },
    { id: 3, created_at: '2024-02-03T00:00:00Z', workflow_id: 100 },
  ];

  it('filters out old runs correctly while keeping the latest', () => {
    const cutoffDate = new Date('2024-02-02T00:00:00Z');
    const runsToDelete = filterRuns(mockRuns, cutoffDate, 1);

    expect(runsToDelete).toEqual([{ id: 1, created_at: '2024-02-01T00:00:00Z', workflow_id: 100 }]);
  });

  it('keeps all runs if they are newer than cutoff', () => {
    const cutoffDate = new Date('2024-01-01T00:00:00Z');
    const runsToDelete = filterRuns(mockRuns, cutoffDate, 1);

    expect(runsToDelete).toEqual([]);
  });
});

describe('getWorkflowRuns', () => {
  beforeEach(() => jest.clearAllMocks());

  it('paginates listWorkflowRunsForRepo for the current repo', async () => {
    const mockRuns = [{ id: 1, created_at: '2024-01-01T00:00:00Z', workflow_id: 10 }];
    paginate.mockResolvedValue(mockRuns);

    const result = await getWorkflowRuns('fake-token');

    expect(paginate).toHaveBeenCalledWith(listWorkflowRunsForRepo, {
      owner: 'test-owner',
      repo: 'test-repo',
      per_page: 100,
    });
    expect(result).toEqual(mockRuns);
  });
});

describe('deleteWorkflowRuns', () => {
  beforeEach(() => jest.clearAllMocks());

  const runs = [
    { id: 1, created_at: '2024-01-01T00:00:00Z', workflow_id: 10 },
    { id: 2, created_at: '2024-01-02T00:00:00Z', workflow_id: 10 },
  ];

  it('does not call the delete API in dry-run mode and returns 0', async () => {
    const count = await deleteWorkflowRuns('fake-token', runs, true);

    expect(deleteWorkflowRun).not.toHaveBeenCalled();
    expect(count).toBe(0);
  });

  it('deletes each run and returns the count when not dry-run', async () => {
    deleteWorkflowRun.mockResolvedValue({});

    const count = await deleteWorkflowRuns('fake-token', runs, false);

    expect(deleteWorkflowRun).toHaveBeenCalledTimes(2);
    expect(deleteWorkflowRun).toHaveBeenNthCalledWith(1, { owner: 'test-owner', repo: 'test-repo', run_id: 1 });
    expect(deleteWorkflowRun).toHaveBeenNthCalledWith(2, { owner: 'test-owner', repo: 'test-repo', run_id: 2 });
    expect(count).toBe(2);
  });
});

describe('run', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getInput.mockImplementation((key: string) => {
      if (key === 'token') return 'fake-token';
      if (key === 'days-ago') return '30';
      if (key === 'keep-latest') return '0';
      return '';
    });
    getBooleanInput.mockReturnValue(true);
  });

  it('does nothing and logs when there are no workflow runs', async () => {
    paginate.mockResolvedValue([]);

    await run();

    expect(deleteWorkflowRun).not.toHaveBeenCalled();
    expect(setFailed).not.toHaveBeenCalled();
    expect(info).toHaveBeenCalledWith('No workflow runs found.');
  });

  it('deletes old runs grouped per workflow and reports the total', async () => {
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 90);
    paginate.mockResolvedValue([
      { id: 1, created_at: oldDate.toISOString(), workflow_id: 10 },
      { id: 2, created_at: oldDate.toISOString(), workflow_id: 20 },
    ]);
    getBooleanInput.mockReturnValue(false);
    deleteWorkflowRun.mockResolvedValue({});

    await run();

    expect(deleteWorkflowRun).toHaveBeenCalledTimes(2);
    expect(setFailed).not.toHaveBeenCalled();
    expect(info).toHaveBeenCalledWith('Total workflow runs deleted: 2');
  });

  it('calls setFailed when a required input is missing', async () => {
    getInput.mockImplementation((_key: string, opts?: { required?: boolean }) => {
      if (opts?.required) throw new Error('Input required and not supplied: token');
      return '';
    });

    await run();

    expect(setFailed).toHaveBeenCalledWith('Input required and not supplied: token');
  });
});
