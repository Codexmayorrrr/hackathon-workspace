import React, { useState } from 'react';
import {
  animate,
  AnimatePresence,
  motion,
  PanInfo,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from 'framer-motion';
import {
  CheckSquare,
  Plus,
  Trash2,
  Check,
  CalendarSync,
} from 'lucide-react';
import { Opportunity, WorkspaceTask } from '../../types';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { formatEventDate } from '../../utils/dateUtils';
import { toast } from 'sonner';

interface TasksDeadlinesSectionProps {
  opportunity: Opportunity;
  onOpenCalendarSync: () => void;
}

interface SwipeableTaskRowProps {
  task: WorkspaceTask;
  priorityColors: string;
  onToggle: () => void;
  onDelete: () => void;
}

const SwipeableTaskRow: React.FC<SwipeableTaskRowProps> = ({
  task,
  priorityColors,
  onToggle,
  onDelete,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const x = useMotionValue(0);
  const completeCueOpacity = useTransform(x, [12, 72], [0, 1]);
  const deleteCueOpacity = useTransform(x, [-72, -12], [1, 0]);

  const snapBack = (velocityX: number) => {
    if (shouldReduceMotion) {
      x.set(0);
      return;
    }
    animate(x, 0, {
      type: 'spring',
      duration: 0.34,
      bounce: 0.16,
      velocity: velocityX,
    });
  };

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x > 68 || info.velocity.x > 420) {
      onToggle();
      snapBack(info.velocity.x);
      return;
    }
    if (info.offset.x < -82 || info.velocity.x < -460) {
      onDelete();
      return;
    }
    snapBack(info.velocity.x);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Linked Swipe Action Cues */}
      <motion.div
        aria-hidden="true"
        style={{ opacity: completeCueOpacity }}
        className="absolute inset-y-0 start-0 w-28 bg-[#ECFDF5] text-[#065F46] flex items-center ps-5 gap-2 text-xs font-semibold pointer-events-none"
      >
        <Check className="w-4 h-4 stroke-[2.25]" />
        <span>{task.completed ? 'Reopen' : 'Done'}</span>
      </motion.div>

      <motion.div
        aria-hidden="true"
        style={{ opacity: deleteCueOpacity }}
        className="absolute inset-y-0 end-0 w-28 bg-rose-50 text-rose-800 flex items-center justify-end pe-5 gap-2 text-xs font-semibold pointer-events-none"
      >
        <span>Delete</span>
        <Trash2 className="w-4 h-4 stroke-[1.75]" />
      </motion.div>

      {/* 1:1 Finger-Tracked Foreground Row */}
      <motion.div
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: -120, right: 110 }}
        dragElastic={0.18}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className={`surface-card p-4 rounded-2xl flex items-center justify-between gap-4 relative z-10 touch-pan-y ${
          task.completed ? 'opacity-75' : 'surface-card-interactive'
        }`}
      >
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          {/* Extended 48x48 hit area wrapping crisp visual box */}
          <button
            type="button"
            role="checkbox"
            aria-checked={task.completed}
            aria-label={task.completed ? `Mark "${task.title}" incomplete` : `Mark "${task.title}" complete`}
            onClick={onToggle}
            className="relative w-9 h-9 -m-1.5 rounded-xl flex items-center justify-center flex-shrink-0 hover:bg-[#F4F4F6] transition-colors before:content-[''] before:absolute before:-inset-1.5"
          >
            <span
              aria-hidden="true"
              className={`w-5 h-5 rounded-md flex items-center justify-center transition-[transform,background-color] duration-150 ${
                task.completed
                  ? 'bg-[#18181B] text-white'
                  : 'bg-[#E4E4E9]'
              }`}
            >
              {task.completed && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
            </span>
          </button>

          <div className="min-w-0 flex-1 space-y-1">
            <button
              type="button"
              onClick={onToggle}
              className={`text-sm font-medium text-start block max-w-full truncate hover:text-[#52525B] transition-colors ${
                task.completed ? 'line-through text-[#63636B]' : 'text-[#18181B]'
              }`}
              title={task.title}
            >
              {task.title}
            </button>

            <div className="flex items-center gap-2 text-xs text-[#52525B] flex-wrap">
              <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold capitalize ${priorityColors}`}>
                {task.priority}
              </span>
              {task.dueDate && (
                <span className="font-mono tabular-nums text-[11px]">
                  Due {formatEventDate(task.dueDate)}
                </span>
              )}
              {task.category && (
                <span className="capitalize text-[11px] text-[#63636B]">· {task.category}</span>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onDelete}
          className="relative w-9 h-9 rounded-xl text-rose-700 hover:bg-rose-50 transition-colors flex items-center justify-center flex-shrink-0 before:content-[''] before:absolute before:-inset-1.5"
          title={`Delete "${task.title}"`}
          aria-label={`Delete task: ${task.title}`}
        >
          <Trash2 aria-hidden="true" className="w-4 h-4 stroke-[1.75]" />
        </button>
      </motion.div>
    </div>
  );
};

export const TasksDeadlinesSection: React.FC<TasksDeadlinesSectionProps> = ({
  opportunity,
  onOpenCalendarSync,
}) => {
  const workspace = useWorkspaceStore((state) => state.getWorkspace(opportunity.id));
  const addWorkspaceTask = useWorkspaceStore((state) => state.addWorkspaceTask);
  const toggleWorkspaceTask = useWorkspaceStore((state) => state.toggleWorkspaceTask);
  const deleteWorkspaceTask = useWorkspaceStore((state) => state.deleteWorkspaceTask);
  const restoreWorkspaceTask = useWorkspaceStore((state) => state.restoreWorkspaceTask);

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

  const handleDeleteWithUndo = (task: WorkspaceTask) => {
    deleteWorkspaceTask(opportunity.id, task.id);
    toast('Task deleted', {
      description: task.title,
      duration: 6000,
      action: {
        label: 'Undo',
        onClick: () => restoreWorkspaceTask(opportunity.id, task),
      },
    });
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

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
      <div className="surface-card p-6 sm:p-8 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-bold text-[#18181B] tracking-tight">
              Tasks & Milestones
            </h2>
            <p className="text-xs sm:text-sm text-[#52525B] leading-relaxed">
              Track critical milestones, deliverables, and custom to-dos for this opportunity.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
            <button
              type="button"
              onClick={onOpenCalendarSync}
              className="btn-tactile-secondary px-4 py-2 rounded-xl text-xs font-medium gap-1.5 min-h-[38px]"
            >
              <CalendarSync aria-hidden="true" className="w-3.5 h-3.5 text-[#52525B] stroke-[1.75]" />
              <span>Calendar sync</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="btn-tactile-primary px-4 py-2 rounded-xl text-xs font-semibold gap-1.5 min-h-[38px]"
            >
              <Plus aria-hidden="true" className="w-3.5 h-3.5 stroke-[2]" />
              <span>New task</span>
            </button>
          </div>
        </div>

        {totalTasks > 0 && (
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#52525B]">Progress</span>
              <span className="font-mono font-bold text-[#18181B] tabular-nums">
                {completedTasks} of {totalTasks} completed ({progressPercent}%)
              </span>
            </div>
            <div
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Workspace task completion"
              className="w-full h-2 bg-[#F4F4F6] rounded-full overflow-hidden"
            >
              <motion.div
                className="h-full bg-[#18181B] rounded-full"
                initial={false}
                animate={{ width: `${progressPercent}%` }}
                transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
              />
            </div>
          </div>
        )}
      </div>

      {/* MILESTONE DATES STRIP */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-[#18181B]">
          Fixed Opportunity Milestones
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {milestones.map((m, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl flex flex-col justify-between space-y-2 ${
                m.isDeadline ? 'bg-[#18181B] text-white' : 'surface-card'
              }`}
            >
              <p
                className={`text-xs font-medium ${
                  m.isDeadline ? 'text-neutral-200' : 'text-[#63636B]'
                }`}
              >
                {m.label}
              </p>
              <p
                className={`text-xs font-mono font-semibold tabular-nums ${
                  m.isDeadline ? 'text-white' : 'text-[#18181B]'
                }`}
              >
                {formatEventDate(m.date)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* USER TASKS LIST */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckSquare aria-hidden="true" className="w-4 h-4 text-[#52525B] stroke-[2]" />
            <h3 className="text-base font-semibold text-[#18181B]">
              Workspace Tasks ({filteredTasks.length})
            </h3>
          </div>

          <div className="flex items-center gap-1 bg-[#F4F4F6] p-1 rounded-xl self-start sm:self-auto" role="group" aria-label="Filter tasks">
            {(['all', 'active', 'completed'] as const).map((f) => (
              <button
                type="button"
                key={f}
                onClick={() => setFilter(f)}
                aria-pressed={filter === f}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-[transform,background-color,color] duration-150 capitalize min-h-[32px] ${
                  filter === f
                    ? 'bg-white text-[#18181B] font-semibold'
                    : 'text-[#52525B] hover:text-[#18181B]'
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
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              onSubmit={handleCreateTask}
              className="surface-card p-5 rounded-2xl space-y-4"
            >
              <h4 className="text-sm font-semibold text-[#18181B]">
                Create Workspace Task
              </h4>

              <div className="space-y-3">
                <div>
                  <label htmlFor="new-task-title" className="text-xs font-medium text-[#52525B] block mb-1.5">
                    Task description
                  </label>
                  <input
                    id="new-task-title"
                    type="text"
                    enterKeyHint="done"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g., Draft 2-minute elevator pitch"
                    className="field-surface w-full rounded-xl px-4 py-2.5 text-base sm:text-sm"
                    autoFocus
                  />
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-1.5" role="group" aria-label="Task priority">
                    <span className="text-xs font-medium text-[#52525B]">Priority:</span>
                    {(['low', 'medium', 'high'] as const).map((p) => (
                      <button
                        type="button"
                        key={p}
                        onClick={() => setNewPriority(p)}
                        aria-pressed={newPriority === p}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize min-h-[32px] ${
                          newPriority === p ? 'btn-tactile-primary font-semibold' : 'btn-tactile-secondary'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <label htmlFor="new-task-due" className="text-xs font-medium text-[#52525B]">
                      Due date:
                    </label>
                    <input
                      id="new-task-due"
                      type="date"
                      value={newDueDate}
                      onChange={(e) => setNewDueDate(e.target.value)}
                      className="field-surface rounded-lg px-2.5 py-1.5 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="btn-tactile-secondary px-4 py-2 rounded-xl text-xs font-medium min-h-[36px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newTitle.trim()}
                  className="btn-tactile-primary px-4 py-2 rounded-xl text-xs font-semibold disabled:opacity-40 min-h-[36px]"
                >
                  Add task
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Task Rows */}
        {filteredTasks.length === 0 ? (
          <div className="surface-card p-8 sm:p-10 rounded-2xl text-center space-y-3">
            <p className="text-sm font-semibold text-[#18181B]">
              {filter === 'all' ? 'No tasks yet' : `No ${filter} tasks`}
            </p>
            <p className="text-xs text-[#52525B] max-w-sm mx-auto">
              Break deliverables into actionable steps to keep your submission schedule on track.
            </p>
            <div className="pt-1">
              {filter !== 'all' ? (
                <button
                  type="button"
                  onClick={() => setFilter('all')}
                  className="btn-tactile-secondary px-4 py-2 rounded-xl text-xs font-medium"
                >
                  Show all tasks
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAdding(true)}
                  className="btn-tactile-primary px-4 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  <Plus aria-hidden="true" className="w-3.5 h-3.5 stroke-[2]" />
                  <span>Add task</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredTasks.map((task) => {
              const priorityColors = {
                high: 'bg-rose-100 text-rose-900',
                medium: 'bg-amber-100 text-amber-950',
                low: 'bg-[#F4F4F6] text-[#52525B]',
              }[task.priority];

              return (
                <SwipeableTaskRow
                  key={task.id}
                  task={task}
                  priorityColors={priorityColors}
                  onToggle={() => toggleWorkspaceTask(opportunity.id, task.id)}
                  onDelete={() => handleDeleteWithUndo(task)}
                />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
