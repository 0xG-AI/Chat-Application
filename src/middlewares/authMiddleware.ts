export const authenticate = (req: any, res: any, next: any) => {
  const username = req.headers['x-username']; // simple header auth for demo
  if (!username) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  req.user = { username };
  next();
};