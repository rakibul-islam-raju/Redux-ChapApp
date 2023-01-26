import { apiSlice } from "../api/apiSlice";
import { messagesApi } from "../messages/messagesApi";

export const conversationsApi = apiSlice.injectEndpoints({
	endpoints: (builder) => ({
		getConversations: builder.query({
			query: (email) =>
				`/conversations?participants_like=${email}&_sort=timestamp&_order=desc&_page=1&_limit=${process.env.REACT_APP_CONVERSATIONS_PER_PAGE}`,
		}),
		getConversation: builder.query({
			query: ({ userEmail, participantEmail }) =>
				`/conversations?participants_like=${userEmail}-${participantEmail}&&participants_like=${participantEmail}-${userEmail}`,
		}),
		addConversation: builder.mutation({
			query: ({ data }) => ({
				url: "/conversations",
				method: "POST",
				body: data,
			}),
			async onQueryStarted(arg, { queryFulfilled, dispatch }) {
				// optimistic cache update start
				const patchResult1 = dispatch(
					apiSlice.util.updateQueryData(
						"getConversations",
						arg.sender,
						(draft) => {
							const newConversation = { ...arg.data };
							newConversation.id = draft[draft.length - 1].id + 1;

							draft.unshift(newConversation);
						}
					)
				);
				// optimistic cache update end

				try {
					const conversation = await queryFulfilled;
					if (conversation.data.id) {
						const { users, message, timestamp } = arg.data;
						const senderUser = users.find((user) => user.email === arg.sender);
						const recieverUser = users.find(
							(user) => user.email !== arg.sender
						);

						dispatch(
							messagesApi.endpoints.addMessage.initiate({
								conversationId: conversation.data.id,
								sender: senderUser,
								receiver: recieverUser,
								message,
								timestamp,
							})
						);
					}
				} catch (err) {
					patchResult1.undo();
				}
			},
		}),
		editConversation: builder.mutation({
			query: ({ id, data }) => ({
				url: `/conversations/${id}`,
				method: "PATCH",
				body: data,
			}),
			async onQueryStarted(arg, { queryFulfilled, dispatch }) {
				// optimistic cache update start
				const patchResult1 = dispatch(
					apiSlice.util.updateQueryData(
						"getConversations",
						arg.sender,
						(draft) => {
							const draftCoversation = draft.find((c) => c.id == arg.id);
							draftCoversation.message = arg.data.message;
							draftCoversation.timestamp = arg.data.timestamp;
						}
					)
				);
				// optimistic cache update end

				try {
					const conversation = await queryFulfilled;
					if (conversation.data.id) {
						const { users, message, timestamp } = arg.data;
						const senderUser = users.find((user) => user.email === arg.sender);
						const recieverUser = users.find(
							(user) => user.email !== arg.sender
						);

						const res = await dispatch(
							messagesApi.endpoints.addMessage.initiate({
								conversationId: conversation.data.id,
								sender: senderUser,
								receiver: recieverUser,
								message,
								timestamp,
							})
						).unwrap();

						// update messages cache pessimistically start
						dispatch(
							apiSlice.util.updateQueryData(
								"getMessages",
								res.conversationId.toString(),
								(draft) => {
									draft.push(res);
								}
							)
						);
						// update messages cache pessimistically end
					}
				} catch (err) {
					patchResult1.undo();
				}
			},
		}),
	}),
});

export const {
	useGetConversationsQuery,
	useGetConversationQuery,
	useAddConversationMutation,
	useEditConversationMutation,
} = conversationsApi;
