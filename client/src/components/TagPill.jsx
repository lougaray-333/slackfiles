export default function TagPill({ tag, removable, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-teal/15 px-2.5 py-0.5 text-xs font-medium text-teal">
      {tag}
      {removable && (
        <button onClick={() => onRemove?.(tag)} className="hover:text-white ml-0.5">
          &times;
        </button>
      )}
    </span>
  );
}
