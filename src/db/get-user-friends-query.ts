"use server";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { userFriendsTable } from "../../drizzle/schema";
import client from "./client";
import getUserDataQuery from "./get-user-data-query";

const getUserFriendsQuery = async ({
  user_id,
  friendState,
}: {
  user_id: string;
  friendState: "pending" | "accepted";
}) => {
  try {
    const db = drizzle(client);

    const getFriendsSentQuery = await db
      .select()
      .from(userFriendsTable)
      .where(
        sql`${userFriendsTable.user_id} = ${user_id} and ${userFriendsTable.requestState} = ${friendState}`,
      );

    const getFriendsReceiverQuery = await db
      .select()
      .from(userFriendsTable)
      .where(
        sql`${userFriendsTable.friend_id} = ${user_id} and ${userFriendsTable.requestState} = ${friendState}`,
      );

    if (getFriendsSentQuery.length > 0) {
      const friendDataQuery = Promise.all(
        await getFriendsSentQuery.map(async (element) => ({
          ...element,
          friendData: await getUserDataQuery({
            user_id: element.friend_id,
          }),
        })),
      );
      return { friends: await friendDataQuery };
    }
    if (getFriendsReceiverQuery.length > 0) {
      const friendDataQuery = Promise.all(
        await getFriendsReceiverQuery.map(async (element) => ({
          ...element,
          friendData: await getUserDataQuery({
            user_id: element.user_id,
          }),
        })),
      );
      return { friends: await friendDataQuery };
    }
    return null;
  } catch (error) {
    console.log(error);
  }
};

export default getUserFriendsQuery;