import Link from "next/link";
import type { AdminTodayTaskItem } from "@/types/admin";

type Props = {
  tasks: AdminTodayTaskItem[];
};

/** 대시보드 — 오늘 처리할 일 큐 */
export function AdminTodayTasks({ tasks }: Props) {
  return (
    <section className="admin-panel admin-today-tasks">
      <div className="admin-panel__header">
        <h2 className="admin-panel__title">오늘 처리할 일</h2>
      </div>
      <ul className="admin-today-tasks__list">
        {tasks.length === 0 ? (
          <li className="admin-today-tasks__empty">지금 확인할 긴급 항목이 없습니다.</li>
        ) : (
          tasks.map((task) => (
            <li key={task.href + task.label}>
              <Link href={task.href} className="admin-today-tasks__item">
                <span className="admin-today-tasks__label">{task.label}</span>
                <span className="admin-today-tasks__count">{task.count}건</span>
                <span className="admin-today-tasks__arrow" aria-hidden>
                  →
                </span>
              </Link>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
