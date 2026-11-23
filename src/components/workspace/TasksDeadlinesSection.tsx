import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckSquare, 
  Plus, 
  Trash2, 
  Check, 
  CalendarSync 
} from 'lucide-react';
import { Opportunity } from '../../types';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { formatEventDate } from '../../utils/dateUtils';
import { toast } from 'sonner';

interface TasksDeadlinesSectionProps {
  opportunity: Opportunity;
  onOpenCalendarSync: () => void;
}

export const TasksDeadlinesSection: React.FC<TasksDeadlinesSectionProps> = ({
  opportunity,
  onOpenCalendarSync,
}) => {
  const workspace = useWorkspaceStore((state) => state.getWorkspace(opportunity.id));
  const addWorkspaceTask = useWorkspaceStore((state) => state.addWorkspaceTask);
  const toggleWorkspaceTask = useWorkspaceStore((state) => state.toggleWorkspaceTask);
  const deleteWorkspaceTask = useWorkspaceStore((state) => state.deleteWorkspaceTask);

  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newDueDate, setNewDueDate] = useState('');

  const tasks = workspace?.tasks || [];

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addWorkspaceTask(opportunity.id, {
      title: newTitle.trim(),
      priority: newPriority,
      dueDate: newDueDate || undefined,
      completed: false,
      category: 'custom',
    });

    setNewTitle('');
    setNewDueDate('');
    setIsAdding(false);
    toast.success('Task added');
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Key Milestones
  const milestones = [
    { label: 'Registration Opens', date: opportunity.registrationOpens },
    { label: 'Application Deadline', date: opportunity.applicationDeadline, isDeadline: true },
    ...(opportunity.eventStart ? [{ label: 'Event Starts', date: opportunity.eventStart }] : []),
    ...(opportunity.submissionCutoff ? [{ label: 'Final Submission Cutoff', date: opportunity.submissionCutoff, isDeadline: true }] : []),
    ...(opportunity.judgingStarts ? [{ label: 'Judging Starts', date: opportunity.judgingStarts }] : []),
    ...(opportunity.winnersAnnounced ? [{ label: 'Winners Announced', date: opportunity.winnersAnnounced }] : []),
  ];

  return (
    <div className="space-y-6 sm:space-y-8 pb-10">
      {/* Overview Progress Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#FDFDFD] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-bold text-neutral-900 tracking-tight">
              Tasks & Milestones
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed" style={{ textWrap: 'pretty' }}>
              Track critical milestones, deliverables, and customized to-do items for this opportunity.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={onOpenCalendarSync}
              className="btn-tactile-secondary px-3.5 py-2 rounded-lg text-xs font-medium gap-1.5"
            >
              <CalendarSync className="w-3.5 h-3.5 text-neutral-500 stroke-[1.75]" />
              <span>Calendar Sync</span>
            </button>

            <button
              onClick={() => setIsAdding(true)}
              className="btn-tactile-primary px-3.5 py-2 rounded-lg text-xs font-semibold gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2]" />
              <span>New Task</span>
            </button>
          </div>
        </div>

        {totalTasks > 0 && (
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-500">Progress</span>
              <span className="font-mono font-bold text-neutral-950 tabular-nums">
                {completedTasks} of {totalTasks} tasks completed ({progressPercent}%)
              </span>
            </div>
            <div className="w-full h-2 bg-[#F5F5F5] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-neutral-900 rounded-full"
                initial={false}
                animate={{ width: `${progressPercent}%` }}
                transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
              />
            </div>
          </div>
        )}
      </div>

      {/* MILESTONE DATES STRIP */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
          Fixed Opportunity Milestones
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {milestones.map((m, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl flex flex-col justify-between space-y-2 ${
                m.isDeadline ? 'bg-neutral-900 text-white' : 'bg-[#FDFDFD]'
              }`}
            >
              <p className={`text-[10px] uppercase font-semibold tracking-wider ${
                m.isDeadline ? 'text-neutral-300' : 'text-neutral-400'
              }`}>
                {m.label}
              </p>
              <p className={`text-xs font-mono font-semibold tabular-nums ${
                m.isDeadline ? 'text-white' : 'text-neutral-900'
              }`}>
                {formatEventDate(m.date)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* USER TASKS LIST */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-neutral-600 stroke-[1.75]" />
            <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider">
              Workspace Tasks ({filteredTasks.length})
            </h3>
          </div>

          <div className="flex items-center gap-1 bg-[#F5F5F5] p-1 rounded-xl">
            {(['all', 'active', 'completed'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors capitalize ${
                  filter === f
                    ? 'bg-white text-neutral-950 font-semibold'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Add Task Inline Form */}
        <AnimatePresence>
          {isAdding && (
            <motion.form
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onSubmit={handleCreateTask}
              className="p-5 rounded-2xl bg-[#FDFDFD] space-y-4"
            >
              <h4 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider">
                Create Workspace Task
              </h4>

              <div className="space-y-3">
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="What needs to be done? (e.g., Draft 2-minute elevator pitch)"
                  className="w-full bg-[#F5F5F5] rounded-xl px-4 py-2.5 text-sm text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900/10 border-0"
                  autoFocus
                />

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-neutral-400">Priority:</span>
                    {(['low', 'medium', 'high'] as const).map((p) => (
                      <button
                        type="button"
                        key={p}
                        onClick={() => setNewPriority(p)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-colors ${
                          newPriority === p
                            ? 'bg-neutral-900 text-white font-semibold'
                            : 'bg-[#F5F5F5] text-neutral-600 hover:text-neutral-900'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-neutral-400">Due:</span>
                    <input
                      type="date"
                      value={newDueDate}
                      onChange={(e) => setNewDueDate(e.target.value)}
                      className="bg-[#F5F5F5] rounded-lg px-2.5 py-1 text-xs text-neutral-800 border-0 focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="btn-tactile-secondary px-3 py-1.5 rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newTitle.trim()}
                  className="btn-tactile-primary px-4 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-40"
                >
                  Add Task
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Task Rows */}
        {filteredTasks.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#FDFDFD] text-center space-y-2">
            <p className="text-sm font-medium text-neutral-700">No {filter !== 'all' ? filter : ''} tasks found</p>
            <p className="text-xs text-neutral-400">Add tasks to track your preparation progress.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTasks.map((task) => {
              const priorityColors = {
                high: 'bg-rose-100 text-rose-800',
                medium: 'bg-amber-100 text-amber-800',
                low: 'bg-neutral-100 text-neutral-600',
              }[task.priority];

              return (
                <div
                  key={task.id}
                  className={`p-4 rounded-xl flex items-center justify-between gap-4 transition-colors ${
                    task.completed ? 'bg-[#FDFDFD] opacity-65' : 'bg-[#FDFDFD] hover:bg-[#F8F8FA]'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <button
                      onClick={() => toggleWorkspaceTask(opportunity.id, task.id)}
                      className={`w-5 h-5 rounded-md flex items-center justify-center transition-all duration-150 active:scale-[0.97] flex-shrink-0 cursor-pointer ${
                        task.completed
                          ? 'bg-neutral-900 text-white'
                          : 'bg-[#F5F5F5] hover:bg-[#EBEBEB]'
                      }`}
                    >
                      {task.completed && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                    </button>

                    <div className="min-w-0 flex-1 space-y-0.5">
                      <p
                        onClick={() => toggleWorkspaceTask(opportunity.id, task.id)}
                        className={`text-sm font-medium cursor-pointer transition-colors truncate ${
                          task.completed ? 'line-through text-neutral-400' : 'text-neutral-950'
                        }`}
                      >
                        {task.title}
                      </p>

                      <div className="flex items-center gap-2 text-[11px] text-neutral-400">
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold uppercase ${priorityColors}`}>
                          {task.priority}
                        </span>
                        {task.dueDate && (
                          <span className="font-mono tabular-nums">
                            Due {formatEventDate(task.dueDate)}
                          </span>
                        )}
                        {task.category && (
                          <span className="capitalize text-neutral-400">· {task.category}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteWorkspaceTask(opportunity.id, task.id)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-[#F5F5F5] transition-colors"
                    title="Delete task"
                  >
                    <Trash2 className="w-3.5 h-3.5 stroke-[1.75]" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
