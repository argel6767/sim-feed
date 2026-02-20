
export const getDomains = () => {
  const domain = process.env.ALLOWED_ORIGIN;
  if(domain) {
    return [domain];
  }
  return ["https://sim-feed.com", "https://www.sim-feed.com"]  
}