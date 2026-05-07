export const calculateCompletion = (profile: any) => {
  if (!profile) return 0;
  
  let score = 0;
  // Basic Info (20%)
  if (profile.basicInfo?.displayName) score += 10;
  if (profile.basicInfo?.dob) score += 10;
  
  // Professional / Location (20%)
  if (profile.background?.occupation) score += 10;
  if (profile.locationName) score += 10;
  
  // Content (20%)
  if (profile.bio && profile.bio.trim().length > 5) score += 10;
  if (profile.lifestyle?.drinking) score += 5;
  if (profile.lifestyle?.smoking) score += 5;
  
  // Photos (40%)
  const photoCount = profile.photos?.length || 0;
  if (photoCount >= 1) score += 10;
  if (photoCount >= 3) score += 20;
  if (photoCount >= 6) score += 10;
  
  return Math.min(score, 100);
};
