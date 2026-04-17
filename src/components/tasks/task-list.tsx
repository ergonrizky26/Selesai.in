import { TaskItem } from '@/components/tasks/task-item';

export function TaskList({
    tasks,
    emptyMessage,
    allLabels = [],
    allProjects = [] // <--- 1. Tambahkan ini
}: {
    tasks: any[],
    emptyMessage?: string,
    allLabels?: any[],
    allProjects?: any[] // <--- 2. Tambahkan ini
}) {
    if (tasks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-purple-100 rounded-xl bg-purple-50/30">
                <p className="text-slate-500">{emptyMessage || "Belum ada tugas."}</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {tasks.map((task) => (
                <TaskItem
                    key={task.id}
                    task={task}
                    allLabels={allLabels}
                    allProjects={allProjects} // <--- 3. Oper ke TaskItem
                />
            ))}
        </div>
    );
}