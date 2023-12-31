import { ButtonComponent } from "../../util/components/button.ts";
import { EPHEMERAL_MESSAGE_FLAG, reply } from "../../util/response.ts";
import { createEmailMessage } from "../../workers/email.ts";
import { ComponentHandler } from "./mod.ts";

export const sendConfirmation: ComponentHandler = {
  id: "sendConfirmation",
  handle: async ({ interaction, storage, kv }) => {
    const email = interaction.data?.components?.at(0)?.components
      // deno-lint-ignore no-explicit-any
      ?.find((component: any) => component.custom_id === "emailInput")
      ?.value;

    if (!email) {
      return reply("Desculpa. Não consegui encontrar seu email.", { flags: EPHEMERAL_MESSAGE_FLAG });
    }

    const preRegisteredUser = await storage.students.findPreRegistered(email);

    if (!preRegisteredUser) {
      return reply(
        `Opa. Não consegui achar o email ${email} no meu banco de dados. Tem certeza que foi com esse email que você comprou o curso?`,
        {
          flags: EPHEMERAL_MESSAGE_FLAG,
        },
      );
    }

    const userExists = await storage.students.existsByEmail(email);

    if (userExists) {
      return reply(
        [
          `Opa. Parece que o email ${email} já está em uso por outro usuário no discord.`,
          "Se você acha que isso é um erro, entre em contato com a moderação",
        ].join(" "),
        { flags: EPHEMERAL_MESSAGE_FLAG },
      );
    }

    await kv.enqueue(createEmailMessage(email, `${interaction.member!.user!.id}`, preRegisteredUser.tier));

    return reply("Enviamos um email com um código de confirmação. Por favor, verifique sua caixa de entrada.", {
      flags: EPHEMERAL_MESSAGE_FLAG,
      components: [
        {
          type: 1,
          components: [
            new ButtonComponent("showConfirmationModal").label("Recebi o código").build(),
            new ButtonComponent("signup").label("Tentar novamente").build(),
          ],
        },
      ],
    });
  },
};
