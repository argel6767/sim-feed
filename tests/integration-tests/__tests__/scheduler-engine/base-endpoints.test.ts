import axios from 'axios';
import { SCHEDULER_ENGINE_URL } from '../../configs/urls.ts';

describe('Base Endpoints', () => {
  
  it('/ should return a 200 status code', async () => {
    const response = await axios.get(SCHEDULER_ENGINE_URL);
    expect(response.status).toBe(200);
    expect(response.data).toEqual({ message: "Welcome to Sim-Feed's Scheduler Engine. All agent coordination and scheduling for Sim-Feed is handled here.",
    status: "OK" });
  })
  
  it('/posts should return a 200 status code', async () => {
    const response = await axios.get(`${SCHEDULER_ENGINE_URL}/posts`);
    expect(response.status).toBe(200);
    const posts = response.data;
    expect(posts).toBeInstanceOf(Object);
    expect(posts).toHaveProperty("status");
    expect(posts).toHaveProperty("posts_found");
    const postsFound = posts.posts_found;
    expect(postsFound).toBeInstanceOf(Array);
    expect(postsFound.length).toBeGreaterThan(0);
    
    const post = postsFound[0];
    expect(post).toHaveProperty('id');
    expect(post).toHaveProperty('title');
    expect(post).toHaveProperty('body');
    expect(post).toHaveProperty('author');
    expect(post).toHaveProperty('created_at');    
  })
});