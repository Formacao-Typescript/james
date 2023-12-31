import { ApplicationCommandOptionTypes } from "deps.ts";
import { EPHEMERAL_MESSAGE_FLAG, reply } from "../../util/response.ts";
import { Command } from "./mod.ts";

export const unlink: Command = {
  name: "unlink",
  description: "Desvincula um usuário do email atualmente vinculado a ele",
  permissions: ["ADMINISTRATOR"],
  allowDm: false,
  options: [
    {
      name: "user",
      description: "Usuário para desvincular do email",
      type: ApplicationCommandOptionTypes.User,
      required: true,
    },
  ],
  run: async ({ interaction, api, storage }) => {
    const roles = await storage.roles.all();
    const userId = interaction.data?.options?.find(({ name }) => name === "user")?.value;

    if (typeof userId !== "string") {
      return reply("Erro ao desvincular. O usuário selecionado não foi encontrado.", { ephemeral: true });
    }

    if (roles.length) {
      await api.removeUserRoles(userId, roles.map((role) => role.role));
    }

    await storage.students.unlinkByDiscordId(userId);

    return reply("Usuário desvinculado com sucesso", { flags: EPHEMERAL_MESSAGE_FLAG });
  },
};
