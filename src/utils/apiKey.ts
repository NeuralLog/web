/**
 * Generates a secure API key with the format nl_[32 random characters]-[32 random characters]
 * The key includes both letters and numbers for better security
 * @returns A secure API key string
 */
export function generateApiKey(): string {
  const prefix = 'nl_';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const segmentLength = 32;

  // Generate two segments of 32 characters each
  const generateSegment = () => {
    // Ensure we have at least one letter and one number
    let segment = '';

    // Add at least one letter
    segment += characters.charAt(Math.floor(Math.random() * 52)); // First 52 chars are letters

    // Add at least one number
    segment += characters.charAt(52 + Math.floor(Math.random() * 10)); // Last 10 chars are numbers

    // Fill the rest of the segment with random characters
    for (let i = 2; i < segmentLength; i++) {
      segment += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    // Shuffle the segment to make it more random
    return segment.split('').sort(() => 0.5 - Math.random()).join('');
  };

  const firstSegment = generateSegment();
  const secondSegment = generateSegment();

  return `${prefix}${firstSegment}-${secondSegment}`;
}
