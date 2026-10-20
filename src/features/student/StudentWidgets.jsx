import { CircleCheck, CirclePlay, ClipboardList, FileText, MessageSquare, PlayCircle, RefreshCw, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EmptyState, ProgressBar, StatusBadge } from '@/components';
import { formatDuration, timeAgo } from '@/utils/format';

/** Video tile (reference: "Featured Videos"): gradient thumbnail, duration, watched badge, progress strip. */
export function VideoCard({ video }) {
  const pct = video.durationSeconds ? Math.min(100, Math.round((video.watchedSeconds / video.durationSeconds) * 100)) : 0;
  return (
    <Link to={`/student/videos/${video.id}`} className="video-card">
      <div className="video-card__thumb">
        <CirclePlay aria-hidden="true" />
        <span className="video-card__duration">{formatDuration(video.durationSeconds)}</span>
        {video.completedAt && (
          <span className="video-card__watched">
            <StatusBadge status="completed" label="Watched" tone="green" />
          </span>
        )}
      </div>
      {pct > 0 && !video.completedAt && <ProgressBar value={pct} label={`${video.title} watched`} />}
      <div className="video-card__body">
        <div style={{ minWidth: 0 }}>
          <div className="video-card__title">{video.title}</div>
          <div className="video-card__sub">{video.moduleTitle || video.courseTitle}</div>
        </div>
        <PlayCircle className="video-card__play" size={22} aria-hidden="true" />
      </div>
    </Link>
  );
}

const ACTIVITY = {
  video_completed: [CirclePlay, 'blue', 'Video Watched'],
  submitted: [ClipboardList, 'green', 'Assignment Submitted'],
  review_completed: [CircleCheck, 'green', 'Assignment Completed'],
  review_rework: [RefreshCw, 'orange', 'Rework Requested'],
  comment: [MessageSquare, 'purple', 'Comment Received'],
  course_completed: [Trophy, 'amber', 'Course Completed'],
};

export function StudentActivity({ items }) {
  if (!items.length) return <EmptyState title="No activity yet" message="Watch a video or submit an assignment to get started." />;
  return (
    <ul className="list">
      {items.map((a) => {
        const [Icon, tone, label] = ACTIVITY[a.kind] ?? [FileText, 'blue', a.kind];
        return (
          <li key={`${a.kind}-${a.refId}-${a.at}`} className="list__item">
            <span className={`timeline-icon tone-${tone}`}>
              <Icon aria-hidden="true" />
            </span>
            <div className="list__main">
              <div className="list__title">{label}</div>
              <div className="list__sub">{a.title}</div>
            </div>
            <span className="list__sub nowrap">{timeAgo(a.at)}</span>
          </li>
        );
      })}
    </ul>
  );
}

/** Numbered module row with status badge (reference: "My Modules"). */
export function ModuleRow({ module, index }) {
  return (
    <li className="list__item">
      <span className="module__index">{index + 1}</span>
      <div className="list__main">
        <Link to={`/student/courses/${module.courseId}#module-${module.id}`} className="list__title">
          {module.title}
        </Link>
        <div className="list__sub">
          {module.progress.itemsDone}/{module.progress.itemsTotal} requirements · {module.lessonCount} lessons
        </div>
      </div>
      <StatusBadge
        status={module.status === 'no_requirements' ? 'not_started' : module.status}
        label={module.status === 'not_started' ? 'Pending' : undefined}
        tone={module.status === 'not_started' ? 'amber' : undefined}
      />
    </li>
  );
}
