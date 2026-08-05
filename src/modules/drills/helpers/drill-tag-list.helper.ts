const TAG_SEPARATOR = ',';

/**
 * A coach types equipment or skill tags as one comma-separated line rather
 * than adding rows one at a time; this is the single place that line is
 * turned into the array the wire contract wants. Blank segments (a trailing
 * comma, doubled commas) are dropped rather than becoming empty tags.
 */
export function parseTagList(value: string): readonly string[] {
  return value
    .split(TAG_SEPARATOR)
    .map((tag) => tag.trim())
    .filter((tag) => tag !== '');
}

/** The inverse of `parseTagList`, for seeding the form from a loaded drill. */
export function formatTagList(tags: readonly string[]): string {
  return tags.join(', ');
}
