import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";
import { useState } from "react";
import { formatDateTime, formatDate } from "@/utils/dateFormat";
import {
  ACTIVITY_STATUS_CLASS_MAP,
  ACTIVITY_STATUS_TEXT_MAP
} from "@/constants";
import {
  ArrowLeftIcon,
  PlayIcon,
  PauseIcon,
  CheckIcon,
  PencilIcon,
  TrashIcon,
  DocumentIcon,
  XMarkIcon,
  ClockIcon,
  UserIcon,
  TagIcon,
  CalendarIcon
} from "@heroicons/react/24/outline";
import FileUploadButton from "@/Components/FileUploadButton";
import { formatMinutesDisplay, exactTooltip } from '@/utils/timeFormat';

export default function Show({ auth, activity }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [isCompleting, setIsCompleting] = useState(false);
  // Sliding complete panel state (match Dashboard/Index behaviour)
  const [showCompletePanel, setShowCompletePanel] = useState(false);
  const [completeFiles, setCompleteFiles] = useState([]);
  const [completeNotes, setCompleteNotes] = useState(activity.notes || "");
  // Prefill completeCount with the number of sessions for this activity when available
  const [completeCount, setCompleteCount] = useState((activity.sessions && activity.sessions.length) ? activity.sessions.length : (activity.count ?? 1));
  const [isEditingCount, setIsEditingCount] = useState(false);
  const [countValue, setCountValue] = useState(activity.count ?? 0);
  const [isSavingCount, setIsSavingCount] = useState(false);

  const getTotalDurationMinutes = (activity) => {
    let total = 0;

    if (activity.sessions && activity.sessions.length > 0) {
      // Sum any stored session.duration values
      total = activity.sessions.reduce((sum, s) => {
        if (s.duration && Number(s.duration) > 0) return sum + Number(s.duration);
        // fallback: compute from timestamps if available
        if (s.started_at && s.ended_at) {
          try {
            const mins = ((new Date(s.ended_at)) - (new Date(s.started_at))) / (1000 * 60);
            return sum + mins;
          } catch (e) {
            return sum;
          }
        }
        return sum;
      }, 0);
    }

    // If no sessions contributed and activity has a real_time_duration or duration, use them
    if (total === 0) {
      if (activity.real_time_duration) return Number(activity.real_time_duration);
      if (activity.duration) return Number(activity.duration);
    }

    return total;
  };

  const handleStatusAction = (action) => {
    if (action === 'complete') {
      // open sliding panel instead of modal
      setCompleteFiles([]);
      setCompleteNotes(activity.notes || "");
      // Prefill with session count when opening the panel
      setCompleteCount((activity.sessions && activity.sessions.length) ? activity.sessions.length : (activity.count ?? 1));
      setShowCompletePanel(true);
      return;
    }

    const actionRoutes = {
      start: "activities.start",
      pause: "activities.pause"
    };

    router.put(route(actionRoutes[action], activity.id), {}, {
      preserveScroll: true,
      onSuccess: () => {
        try { localStorage.setItem('activities_updated', Date.now().toString()); } catch(e) {}
      }
    });
  };

  const deleteActivity = () => {
    if (!window.confirm("Are you sure you want to delete this activity?")) {
      return;
    }

    setIsDeleting(true);
    router.delete(route("activities.destroy", activity.id));
  };

  const downloadFile = (file) => {
    window.open(route("activity-files.download", file.id), "_blank");
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setUploadFiles(files);
  };
  const handleCompleteFileSelect = (event) => {
    const files = Array.from(event.target.files || []);
    setCompleteFiles(files);
  };

  const handleRemoveCompleteFile = (index) => {
    setCompleteFiles(prev => prev.filter((_, i) => i !== index));
  };

  const submitComplete = async () => {
    if (!activity) return;
    setIsCompleting(true);
    try {
      const formData = new FormData();
      formData.append('_method', 'PUT');
      formData.append('count', completeCount);
      if (completeNotes && completeNotes.trim() !== '') {
        formData.append('notes', completeNotes.trim());
      }
      completeFiles.forEach((f) => formData.append('files[]', f));

      await router.post(route('activities.complete', activity.id), formData, {
        preserveScroll: true,
        onSuccess: () => {
          setShowCompletePanel(false);
          setCompleteFiles([]);
          try { localStorage.setItem('activities_updated', Date.now().toString()); } catch(e) {}
        },
        onFinish: () => setIsCompleting(false),
      });
    } catch (err) {
      console.error('Failed completing activity:', err);
      setIsCompleting(false);
    }
  };

  const removeFile = (index) => {
    setUploadFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link
              href={route("activities.index")}
              className="mr-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </Link>
            <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
              Activity Details
            </h2>
          </div>

          <div className="flex space-x-2">
            {activity.status !== "completed" && (
              <>
                {activity.status === "started" ? (
                  <button
                    onClick={() => handleStatusAction("pause")}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-md text-sm font-medium inline-flex items-center"
                  >
                    <PauseIcon className="w-4 h-4 mr-1" />
                    Pause
                  </button>
                ) : (
                  <button
                    onClick={() => handleStatusAction("start")}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-md text-sm font-medium inline-flex items-center"
                  >
                    <PlayIcon className="w-4 h-4 mr-1" />
                    Start
                  </button>
                )}

                <button
                  onClick={() => handleStatusAction("complete")}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium inline-flex items-center"
                >
                  <CheckIcon className="w-4 h-4 mr-1" />
                  Complete
                </button>
              </>
            )}

            <Link
              href={route("activities.edit", activity.id)}
              className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-2 rounded-md text-sm font-medium inline-flex items-center"
            >
              <PencilIcon className="w-4 h-4 mr-1" />
              Edit
            </Link>

            <FileUploadButton
              activityId={activity.id}
              variant="secondary"
              size="md"
              modalTitle={`Upload Files to "${activity.activity_category?.name || 'Activity'}"`}
            >
              Upload Files
            </FileUploadButton>

            <button
              onClick={deleteActivity}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-3 py-2 rounded-md text-sm font-medium inline-flex items-center"
            >
              <TrashIcon className="w-4 h-4 mr-1" />
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      }
    >
      <Head title={`Activity - ${activity.activity_category?.name || 'Unknown'}`} />

      <div className="py-2">
        <div className="max-w-full mx-auto sm:px-6 lg:px-8 space-y-6">
          {/* Compact Main Activity Info */}
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-4 md:p-6">
              <div className="flex items-start justify-between space-x-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {activity.activity_category?.name || 'Activity'}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {activity.description || 'No description'}
                  </p>

                  {activity.notes && (
                    <div className="mt-3">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Notes</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{activity.notes}</p>
                    </div>
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full text-white ${ACTIVITY_STATUS_CLASS_MAP[activity.status]}`}>
                      {ACTIVITY_STATUS_TEXT_MAP[activity.status]}
                    </span>

                    <span className="inline-flex items-center px-2 py-1 text-xs rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                      <UserIcon className="w-4 h-4 mr-1 text-gray-400" />
                      {activity.user?.name || 'Unassigned'}
                    </span>

                    <span className="inline-flex items-center px-2 py-1 text-xs rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                      <DocumentIcon className="w-4 h-4 mr-1 text-gray-400" />
                      {activity.files?.length || 0} file(s)
                    </span>

                    <span title={exactTooltip(getTotalDurationMinutes(activity))} aria-label={exactTooltip(getTotalDurationMinutes(activity))} className="inline-flex items-center px-2 py-1 text-xs rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                      <ClockIcon className="w-4 h-4 mr-1 text-gray-400" />
                      {formatMinutesDisplay(getTotalDurationMinutes(activity))}
                    </span>

                    {/* Count display / edit */}
                    <div className="inline-flex items-center">
                      {!isEditingCount ? (
                        <button
                          onClick={() => setIsEditingCount(true)}
                          className="inline-flex items-center px-2 py-1 text-xs rounded bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700"
                        >
                          Count: <span className="ml-2 font-medium">{activity.count ?? 0}</span>
                        </button>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            min="0"
                            className="w-20 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
                            value={countValue}
                            onChange={(e) => setCountValue(Number(e.target.value))}
                          />
                          <button
                            onClick={async () => {
                              setIsSavingCount(true);
                              try {
                                await router.put(route('activities.update', activity.id), { count: countValue }, {
                                  preserveScroll: true,
                                  onSuccess: () => {
                                    setIsEditingCount(false);
                                    // reload to fetch updated activity
                                    router.reload({ only: ['activity'] });
                                  },
                                  onError: () => {
                                    alert('Failed to save count');
                                  }
                                });
                              } catch (err) {
                                console.error(err);
                              } finally {
                                setIsSavingCount(false);
                              }
                            }}
                            className="px-2 py-1 bg-green-600 text-white rounded text-sm"
                            disabled={isSavingCount}
                          >
                            Save
                          </button>
                          <button
                            onClick={() => { setIsEditingCount(false); setCountValue(activity.count ?? 0); }}
                            className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-sm rounded"
                            disabled={isSavingCount}
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Started</div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">{activity.started_at ? formatDateTime(activity.started_at) : '—'}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">Ended</div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">{activity.ended_at ? formatDateTime(activity.ended_at) : '—'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Files Section */}
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Files ({activity.files?.length || 0})
                </h3>
                {/* Add upload button here if needed */}
              </div>

              {activity.files && activity.files.length > 0 ? (
                <div className="space-y-3">
                  {activity.files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <div className="flex items-center">
                        <DocumentIcon className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {file.original_name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {file.file_size_in_kb} • {file.mime_type}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => downloadFile(file)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                      >
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <DocumentIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No files attached to this activity</p>
                </div>
              )}
            </div>
          </div>

          {/* Session History Section */}
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Session History ({activity.sessions?.length || 0})
                </h3>
              </div>

              {activity.sessions && activity.sessions.length > 0 ? (
                <div className="space-y-4">
                  {activity.sessions.map((session, index) => (
                    <div
                      key={session.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium px-2 py-1 rounded">
                            Session #{activity.sessions.length - index}
                          </div>
                        </div>
                            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                              {(() => {
                                const mins = session.duration && Number(session.duration) > 0
                                  ? Number(session.duration)
                                  : (session.started_at && session.ended_at
                                    ? (((new Date(session.ended_at)) - (new Date(session.started_at))) / (1000 * 60))
                                    : null);
                                if (mins !== null) return formatMinutesDisplay(mins);
                                return session.started_at ? 'In Progress' : '—';
                              })()}
                            </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Started:</span>
                          <div className="text-gray-900 dark:text-gray-100 font-medium">
                            {formatDateTime(session.started_at)}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">
                            {session.ended_at ? 'Ended:' : 'Status:'}
                          </span>
                          <div className="text-gray-900 dark:text-gray-100 font-medium">
                            {session.ended_at ? (
                              formatDateTime(session.ended_at)
                            ) : (
                              <span className="text-green-600 dark:text-green-400 flex items-center">
                                <ClockIcon className="w-4 h-4 mr-1" />
                                Active
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Session duration breakdown */}
                        {session.started_at && session.ended_at && (
                        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Duration: {formatDate(session.started_at)} to {formatDate(session.ended_at)}
                            {(() => {
                              try {
                                const mins = session.duration && Number(session.duration) > 0
                                  ? Number(session.duration)
                                  : (((new Date(session.ended_at)) - (new Date(session.started_at))) / (1000 * 60));
                                return ` (${formatMinutesDisplay(mins)})`;
                              } catch (e) {
                                return '';
                              }
                            })()}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Total sessions summary */}
                  <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {activity.sessions.length}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Total Sessions
                          </div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {activity.sessions.filter(s => s.ended_at).length}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Completed
                          </div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {activity.sessions.filter(s => !s.ended_at).length}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Active
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <ClockIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No session history available</p>
                  <p className="text-sm mt-1">Sessions will appear here once you start working on this activity</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sliding Complete Panel (replaces modal) */}
      <div className={`fixed inset-y-0 right-0 z-50 w-96 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out ${showCompletePanel ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Complete Activity</h3>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{activity.activity_category?.name || activity.description}</div>
            </div>
            <button onClick={() => setShowCompletePanel(false)} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 px-6 py-4 overflow-y-auto space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Add Files</label>
              <input type="file" multiple onChange={handleCompleteFileSelect} className="w-full" />
              {completeFiles.length > 0 && (
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">{completeFiles.length} file(s) selected</div>
              )}
              {completeFiles.length > 0 && (
                <div className="mt-2 space-y-2">
                  {completeFiles.map((f, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <div className="text-sm text-gray-900 dark:text-gray-100">{f.name}</div>
                      <button onClick={() => handleRemoveCompleteFile(idx)} className="text-red-500 text-sm">Remove</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes (optional)</label>
              <textarea value={completeNotes} onChange={e => setCompleteNotes(e.target.value)} placeholder="Add notes (optional)" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md resize-y" rows={4} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Count</label>
              <input type="number" min={1} value={completeCount} onChange={e => setCompleteCount(Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md" />
              <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Sessions in this activity: <span className="font-medium text-gray-700 dark:text-gray-200">{activity.sessions ? activity.sessions.length : 0}</span>
                {' '}• Total time: <span className="font-medium text-gray-700 dark:text-gray-200">{formatMinutesDisplay(getTotalDurationMinutes(activity))}</span>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex space-x-3">
            <button onClick={() => setShowCompletePanel(false)} className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">Cancel</button>
            <button onClick={submitComplete} disabled={isCompleting} className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-sm text-white uppercase tracking-widest hover:bg-green-700 focus:bg-green-700 active:bg-green-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50">{isCompleting ? 'Submitting...' : 'Submit'}</button>
          </div>
        </div>
      </div>

      {showCompletePanel && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-40 transition-opacity duration-300" onClick={() => setShowCompletePanel(false)}></div>
      )}
    </AuthenticatedLayout>
  );
}
