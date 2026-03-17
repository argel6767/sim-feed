import type { NewCommentDto, CommentDto } from "~/lib/user-api-dtos"
import { userApiClient } from "../apiConfig"

const V1_COMMENTS = "/api/v1/comments"

export const createComment = async (comment: NewCommentDto): Promise<CommentDto> => {
  const response = await userApiClient.post(V1_COMMENTS, comment)
  return response.data
}

export const updateComment = async (comment: CommentDto): Promise<CommentDto> => {
  const response = await userApiClient.put(`${V1_COMMENTS}/${comment.commentId}`, comment)
  return response.data
}

export const deleteComment = async (commentId: number): Promise<void> => {
  await userApiClient.delete(`${V1_COMMENTS}/${commentId}`)
}
