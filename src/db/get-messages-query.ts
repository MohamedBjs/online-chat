"use server";
import { eq, max, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import {
  privateChatTable,
  publicChatTable,
  usersTable,
} from "../../drizzle/schema";
import client from "./client";

const getMesagesQuery = async ({
  chat_id,
  quantity,
}: {
  chat_id: string;
  quantity: number;
}) => {
  try {
    const db = drizzle(client);
    if (chat_id != "") {
      const getPrivateChatMessages = await db
        .select()
        .from(privateChatTable)
        .where(sql`${privateChatTable.chat_id} = ${chat_id}`);
      const messagesWithRole = await Promise.all(
        getPrivateChatMessages.map(async (element) => ({
          ...element,
          user_details: (
            await db
              .select()
              .from(usersTable)
              .where(eq(usersTable.id, element.user_id as string))
          )[0],
          messageReplyData: element.reply
            ? (
                await db
                  .select()
                  .from(privateChatTable)
                  .where(eq(privateChatTable.id, Number(element.reply)))
              )[0]
            : null,
        })),
      );
      return await { messages: messagesWithRole, status: 200 };
    }

    if (chat_id == "") {
      const getMaxIDMessages = (
        await db
          .select({ maxID: max(publicChatTable.id) })
          .from(publicChatTable)
      )[0].maxID;

      const getPublicChatMessages = await db
        .select()
        .from(publicChatTable)
        .where(sql`${publicChatTable.id} > ${getMaxIDMessages! - quantity}`);
      const messagesWithRole = await Promise.all(
        getPublicChatMessages.map(async (element) => ({
          ...element,
          user_details: (
            await db
              .select()
              .from(usersTable)
              .where(eq(usersTable.id, element.user_id as string))
          )[0],
          messageReplyData: element.reply
            ? (
                await db
                  .select()
                  .from(publicChatTable)
                  .where(eq(publicChatTable.id, Number(element.reply)))
              )[0]
            : null,
        })),
      );

      return await {
        messages: messagesWithRole,
        status: 200,
        maxIDMessages: getMaxIDMessages,
      };
    }
  } catch (error) {
    console.log(error);
  }
};

export default getMesagesQuery;
