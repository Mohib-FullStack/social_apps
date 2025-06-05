┌───────────┐ ┌────────────┐
│ User A │ │ Backend │
│ (sender) │ │ (Express/ │
└─────┬─────┘ │ Django) │
│ └─────┬───────┘
│ │
│ 1) “Send Friend Request” │
│────────────────────────────────────────────────▶│
│ │
│ 1a) Create “FriendRequest” in DB │
│ 1b) Create Notification record: │
│ { userId: B, senderId: A, │
│ type: 'friend_request', │
│ metadata: { │
│ friendRequestId: 123 │
│ } } │
│ │
│ │
┌─────▼─────┐ ┌─────▼──────┐
│ User B │ │ PostgreSQL │
│ (recipient) └────────────┘
└─────┬─────┘
│
│ 2) User B opens /notifications endpoint
│ (fetchNotifications API call)
│────────────────────────────────────────────────▶ Backend
│ │
│ Query “notifications
│ WHERE userId = B
│ AND page=1, size=20”
│ (type = 'friend_request'…)
│ │
│ Respond with JSON  
 │ ◀───────────────────────────────────────│
│ [{ id: 42, senderId: A, type:'friend_request',
│ metadata:{friendRequestId:123}, isRead:false, …}, …]
│
│ 3) **NotificationPanel** in React shows his “You have a new friend request” card
│
│
│ 4) User B clicks “Accept” (or “Reject”) on that card
│─── dispatch(acceptFriendRequest({ notificationId:42, senderId:A })) or
│ dispatch(rejectFriendRequest({ notificationId:42, senderId:A }))
│ │
│ │
│ ▼
│ Backend endpoint:
│ POST /friends/accept { senderId: A }
│ (or POST /friends/reject { senderId: A })
│
│ In the same API handler:
│ ─ Create or update Friendship table:
│ (mark status = “accepted” or “rejected”)
│ ─ Then create a new notification FOR User A:
│ { userId: A, senderId: B,
│ type: 'friend_request_accepted',
│ metadata:{ friendRequestId: 123 } }
│ (OR if rejected, type: 'friend_request_rejected')
│ ─ Optionally: delete or mark the original
│ “friend_request” notification as read for User B
│
│ │
│ ─ Return HTTP 200 OK to front end
│ │
│ ◀──────────────────────────────────────────────────
│ { success: true }
│
│ 5) Front-end Redux extraReducer for acceptFriendRequest.fulfilled:
│ – Remove that notification (ID = 42) from `notifications.items` (so it disappears)
│ – Optionally update unreadCount
│
│ 6) Redux then issues a “showSnackbar({ message:'Friend request accepted', ... })”
│
│
┌──────▼──────┐
│ User A’s │
│ Notification│
│ Panel │
└──────┬──────┘
│
│ 7) If/when User A opens their own `/notifications` or
│ Socket.io pushes a new notification event to Browser,
│ they will see a new notification of type `'friend_request_accepted'`
│ (or `'friend_request_rejected'`).
│
│ In other words, the Accept/Reject action _creates_
│ a second notification for the original sender.
│
▼
(Ends)
