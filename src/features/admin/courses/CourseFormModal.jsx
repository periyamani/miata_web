import { FormModal, useToast } from '@/components';
import { api } from '@/services/api';

const DURATION_UNITS = [
  { value: 'days', label: 'Days' },
  { value: 'weeks', label: 'Weeks' },
  { value: 'months', label: 'Months' },
  { value: 'years', label: 'Years' },
];

const FIELDS = [
  { name: 'title', label: 'Course title', required: true, span: true, placeholder: 'e.g. PG Diploma in Ultrasound' },
  { name: 'code', label: 'Course code', required: true, hint: 'Letters, numbers and dashes, e.g. PGDU' },
  { name: 'category', label: 'Category', placeholder: 'e.g. Diploma, Clinical, CPD' },
  { name: 'durationValue', label: 'Duration', type: 'number' },
  { name: 'durationUnit', label: 'Duration unit', type: 'select', options: DURATION_UNITS },
  {
    name: 'feeAmount',
    label: 'Course fee',
    placeholder: 'e.g. 36000',
    hint: 'Charged to each new enrolment (adjust per student on their page). Existing students keep their fee.',
  },
  { name: 'description', label: 'Description', type: 'textarea', span: true },
  { name: 'isActive', label: 'Course is active (students can access its content)', type: 'checkbox' },
];

/** Create (course = null) or edit a course. */
export function CourseFormModal({ open, course, onClose, onSaved }) {
  const toast = useToast();
  return (
    <FormModal
      open={open}
      title={course ? 'Edit course' : 'Add course'}
      submitLabel={course ? 'Save changes' : 'Create course'}
      fields={FIELDS}
      initialValues={{
        title: course?.title ?? '',
        code: course?.code ?? '',
        category: course?.category ?? '',
        durationValue: course?.durationValue ?? '',
        durationUnit: course?.durationUnit ?? '',
        feeAmount: course?.feeAmount ?? '',
        description: course?.description ?? '',
        isActive: course?.isActive ?? true,
      }}
      validate={(values) => ({
        durationValue: Boolean(values.durationValue) !== Boolean(values.durationUnit) ? 'Enter both the duration and its unit' : null,
        feeAmount:
          values.feeAmount !== '' && !/^\d+(\.\d{1,2})?$/.test(String(values.feeAmount).trim())
            ? 'Enter the fee as a number, e.g. 36000'
            : null,
      })}
      onSubmit={async (values) => {
        const payload = {
          ...values,
          code: values.code.trim().toUpperCase(),
          durationValue: values.durationValue ? Number(values.durationValue) : null,
          durationUnit: values.durationUnit || null,
          feeAmount: values.feeAmount === '' ? null : Number(values.feeAmount),
        };
        const res = course ? await api.put(`/admin/courses/${course.id}`, payload) : await api.post('/admin/courses', payload);
        toast.success(course ? 'Course updated' : 'Course created');
        return res.data;
      }}
      onSuccess={onSaved}
      onClose={onClose}
    />
  );
}
