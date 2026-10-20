import { useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  ChevronDown,
  ChevronRight,
  FileText,
  Pencil,
  Plus,
  SlidersHorizontal,
  Trash2,
  X,
} from 'lucide-react';
import { Button, Card, EmptyState, FormModal, useConfirm } from '@/components';
import { useApiAction } from '@/hooks/useApiAction';
import { api } from '@/services/api';
import { AvailabilityChips, AvailabilityModal } from '../shared/BatchAvailability';

const MODULE_FIELDS = [
  { name: 'title', label: 'Module title', required: true, span: true },
  { name: 'description', label: 'Description', type: 'textarea', span: true },
];
const LESSON_FIELDS = [
  { name: 'title', label: 'Lesson title', required: true, span: true },
  { name: 'durationMinutes', label: 'Duration (minutes)', type: 'number' },
  { name: 'content', label: 'Lesson notes / content', type: 'textarea', span: true, rows: 6 },
];

function move(list, index, delta) {
  const ids = list.map((x) => x.id);
  const target = index + delta;
  [ids[index], ids[target]] = [ids[target], ids[index]];
  return ids;
}

/** Modules (ordered) with their lessons, module-level professors and batch availability. */
export function CurriculumTab({ course, professors, onChange }) {
  const confirm = useConfirm();
  const { run } = useApiAction();
  const [expanded, setExpanded] = useState(() => new Set(course.modules.slice(0, 1).map((m) => m.id)));
  const [dialog, setDialog] = useState(null); // { kind: 'module'|'lesson', item?, moduleId? }
  const [availability, setAvailability] = useState(null); // module whose batches are being edited

  const toggle = (id) =>
    setExpanded((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const saveModule = async (values) => {
    if (dialog.item) await api.put(`/admin/modules/${dialog.item.id}`, values);
    else await api.post(`/admin/courses/${course.id}/modules`, values);
    onChange();
  };

  const saveLesson = async (values) => {
    const payload = { ...values, durationMinutes: values.durationMinutes ? Number(values.durationMinutes) : null };
    if (dialog.item) await api.put(`/admin/lessons/${dialog.item.id}`, payload);
    else await api.post(`/admin/modules/${dialog.moduleId}/lessons`, payload);
    onChange();
  };

  const removeModule = async (m) => {
    const ok = await confirm({
      title: `Delete “${m.title}”?`,
      message: `Its ${m.lessons.length} lesson(s) are deleted. Videos and assignments stay on the course without a module.`,
      confirmLabel: 'Delete module',
      danger: true,
    });
    if (ok) await run(() => api.delete(`/admin/modules/${m.id}`), { success: 'Module deleted', onDone: onChange });
  };

  const removeLesson = async (l) => {
    if (await confirm({ title: `Delete lesson “${l.title}”?`, confirmLabel: 'Delete lesson', danger: true })) {
      await run(() => api.delete(`/admin/lessons/${l.id}`), { success: 'Lesson deleted', onDone: onChange });
    }
  };

  const reorderModules = (index, delta) =>
    run(() => api.put(`/admin/courses/${course.id}/modules/order`, { ids: move(course.modules, index, delta) }), { onDone: onChange });
  const reorderLessons = (m, index, delta) =>
    run(() => api.put(`/admin/modules/${m.id}/lessons/order`, { ids: move(m.lessons, index, delta) }), { onDone: onChange });

  const assignProfessor = (moduleId, professorId) =>
    run(() => api.post(`/admin/modules/${moduleId}/professors`, { professorId: Number(professorId) }), {
      success: 'Professor assigned to module',
      onDone: onChange,
    });
  const unassignProfessor = (moduleId, professorId) =>
    run(() => api.delete(`/admin/modules/${moduleId}/professors/${professorId}`), {
      success: 'Professor removed from module',
      onDone: onChange,
    });

  return (
    <Card
      title="Modules & Lessons"
      subtitle="Students see modules and lessons in this order."
      action={
        <Button icon={Plus} size="sm" onClick={() => setDialog({ kind: 'module' })}>
          Add module
        </Button>
      }
    >
      {course.modules.length === 0 ? (
        <EmptyState icon={BookOpen} title="No modules yet" message="Add the first module of this course." />
      ) : (
        <div className="curriculum">
          {course.modules.map((m, mi) => {
            const open = expanded.has(m.id);
            const available = professors.filter((p) => p.isActive && !m.professors.some((x) => x.id === p.id));
            return (
              <div key={m.id} className="module">
                <div className="module__head">
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => toggle(m.id)}
                    aria-expanded={open}
                    aria-label={open ? 'Collapse module' : 'Expand module'}
                  >
                    {open ? <ChevronDown /> : <ChevronRight />}
                  </button>
                  <span className="module__index">{mi + 1}</span>
                  <div style={{ minWidth: 0 }}>
                    <div className="module__title">{m.title}</div>
                    <div className="module__sub">
                      {m.lessons.length} lessons · {m.videoCount} videos · {m.assignmentCount} assignments
                    </div>
                    {m.batches.length > 0 && (
                      <div style={{ marginTop: 4 }}>
                        <AvailabilityChips batches={m.batches} />
                      </div>
                    )}
                  </div>
                  <div className="module-admin__actions">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={ArrowUp}
                      disabled={mi === 0}
                      onClick={() => reorderModules(mi, -1)}
                      aria-label="Move module up"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={ArrowDown}
                      disabled={mi === course.modules.length - 1}
                      onClick={() => reorderModules(mi, 1)}
                      aria-label="Move module down"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Pencil}
                      onClick={() => setDialog({ kind: 'module', item: m })}
                      aria-label="Edit module"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={SlidersHorizontal}
                      onClick={() => setAvailability(m)}
                      aria-label="Choose which batches get this module"
                    />
                    <Button variant="ghost" size="sm" icon={Trash2} onClick={() => removeModule(m)} aria-label="Delete module" />
                  </div>
                </div>
                {open && (
                  <div className="module__body">
                    {m.description && (
                      <p className="muted" style={{ margin: '8px 0', fontSize: 'var(--fs-sm)' }}>
                        {m.description}
                      </p>
                    )}

                    <div className="row row--wrap" style={{ margin: '10px 0' }}>
                      <strong style={{ fontSize: 'var(--fs-sm)' }}>Module professors:</strong>
                      {m.professors.length === 0 && (
                        <span className="muted" style={{ fontSize: 'var(--fs-sm)' }}>
                          None (course professors review all assignments)
                        </span>
                      )}
                      {m.professors.map((p) => (
                        <span key={p.id} className="chip">
                          {p.fullName}
                          <button type="button" onClick={() => unassignProfessor(m.id, p.id)} aria-label={`Remove ${p.fullName}`}>
                            <X />
                          </button>
                        </span>
                      ))}
                      {available.length > 0 && (
                        <select
                          className="select select--inline"
                          value=""
                          onChange={(e) => e.target.value && assignProfessor(m.id, e.target.value)}
                          aria-label="Assign professor to module"
                        >
                          <option value="">+ Assign professor</option>
                          {available.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.fullName}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    {m.lessons.map((l, li) => (
                      <div key={l.id} className="lesson">
                        <FileText className="lesson__icon" size={18} aria-hidden="true" />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="lesson__title">
                            {li + 1}. {l.title} {l.durationMinutes ? <span className="muted">· {l.durationMinutes} min</span> : null}
                          </div>
                          {l.content && (
                            <div className="lesson__content">{l.content.length > 220 ? `${l.content.slice(0, 220)}…` : l.content}</div>
                          )}
                        </div>
                        <div className="module-admin__actions">
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={ArrowUp}
                            disabled={li === 0}
                            onClick={() => reorderLessons(m, li, -1)}
                            aria-label="Move lesson up"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={ArrowDown}
                            disabled={li === m.lessons.length - 1}
                            onClick={() => reorderLessons(m, li, 1)}
                            aria-label="Move lesson down"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Pencil}
                            onClick={() => setDialog({ kind: 'lesson', item: l, moduleId: m.id })}
                            aria-label="Edit lesson"
                          />
                          <Button variant="ghost" size="sm" icon={Trash2} onClick={() => removeLesson(l)} aria-label="Delete lesson" />
                        </div>
                      </div>
                    ))}
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={Plus}
                      onClick={() => setDialog({ kind: 'lesson', moduleId: m.id })}
                      style={{ marginTop: 10 }}
                    >
                      Add lesson
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <FormModal
        open={dialog?.kind === 'module'}
        title={dialog?.item ? 'Edit module' : 'Add module'}
        fields={MODULE_FIELDS}
        size="md"
        initialValues={{ title: dialog?.item?.title ?? '', description: dialog?.item?.description ?? '' }}
        onSubmit={saveModule}
        onClose={() => setDialog(null)}
      />
      <FormModal
        open={dialog?.kind === 'lesson'}
        title={dialog?.item ? 'Edit lesson' : 'Add lesson'}
        fields={LESSON_FIELDS}
        initialValues={{
          title: dialog?.item?.title ?? '',
          durationMinutes: dialog?.item?.durationMinutes ?? '',
          content: dialog?.item?.content ?? '',
        }}
        onSubmit={saveLesson}
        onClose={() => setDialog(null)}
      />
      {availability && (
        <AvailabilityModal
          kind="module"
          item={availability}
          courseId={course.id}
          onClose={() => setAvailability(null)}
          onSaved={onChange}
        />
      )}
    </Card>
  );
}
