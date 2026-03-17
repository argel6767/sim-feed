import type { NewCommentDto, CommentDto } from "~/lib/user-api-dtos"
import { userApiClient } from "../apiConfig"

const V1_COMMENTS = "/api/v1/comments"

export const createComment = async (comment: NewCommentDto, token: string): Promise<CommentDto> => {
  const response = await userApiClient.post(V1_COMMENTS, comment, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data
}

export const updateComment = async (comment: CommentDto, token: string): Promise<CommentDto> => {
  const response = await userApiClient.put(`${V1_COMMENTS}/${comment.commentId}`, comment, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data
}

export const deleteComment = async (commentId: number, token: string): Promise<void> => {
  await userApiClient.delete(`${V1_COMMENTS}/${commentId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}
