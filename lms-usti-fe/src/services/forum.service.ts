import instance from "@/lib/axios";
import endpoint from "./endpoint.constant";

export const forumServices = {
  getPosts: () =>
    instance.get(`${endpoint.FORUM}/posts`),
  createPost: (payload: { title: string; content: string }) =>
    instance.post(`${endpoint.FORUM}/posts`, payload),
  getPostById: (postId: string) =>
    instance.get(`${endpoint.FORUM}/posts/${postId}`),
  deletePost: (postId: string) =>
    instance.delete(`${endpoint.FORUM}/posts/${postId}`),
  getComments: (postId: string) =>
    instance.get(`${endpoint.FORUM}/posts/${postId}/comments`),
  createComment: (postId: string, payload: { content: string }) =>
    instance.post(`${endpoint.FORUM}/posts/${postId}/comments`, payload),
  deleteComment: (postId: string, commentId: string) =>
    instance.delete(`${endpoint.FORUM}/posts/${postId}/comments/${commentId}`),
};
