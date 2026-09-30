import { defineArrayMember, defineField, defineType } from "sanity";

export const postType = defineType({
  name: "post",
  title: "Artigos",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Título",
      type: "string",
      validation: (rule) => rule.required().min(10).max(110),
    }),
    defineField({
      name: "slug",
      title: "Endereço do artigo",
      description: "Clique em Gerar para criar o endereço a partir do título.",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "excerpt",
      title: "Resumo",
      description: "Texto curto usado na página principal do blog.",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required().min(40).max(220),
    }),
    defineField({
      name: "category",
      title: "Categoria",
      type: "string",
      options: {
        list: [
          "Branding",
          "Design",
          "Estratégia de marca",
          "Identidade visual",
          "Marketing",
          "Presença digital",
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "coverImage",
      title: "Imagem de capa",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Descrição da imagem",
          description: "Descreva a imagem para acessibilidade e SEO.",
          type: "string",
          validation: (rule) => rule.required(),
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "body",
      title: "Conteúdo",
      type: "array",
      of: [
        defineArrayMember({
          type: "block",
          styles: [
            { title: "Texto", value: "normal" },
            { title: "Título 2", value: "h2" },
            { title: "Título 3", value: "h3" },
            { title: "Título 4", value: "h4" },
            { title: "Citação", value: "blockquote" },
          ],
          marks: {
            annotations: [
              {
                name: "link",
                title: "Link",
                type: "object",
                fields: [{ name: "href", title: "Endereço", type: "url" }],
              },
            ],
          },
        }),
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
          fields: [
            { name: "alt", title: "Descrição da imagem", type: "string", validation: (rule) => rule.required() },
            { name: "caption", title: "Legenda", type: "string" },
          ],
        }),
      ],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "author",
      title: "Autoria",
      type: "string",
      initialValue: "YA Design",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "publishedAt",
      title: "Data de publicação",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "readingTime",
      title: "Tempo de leitura (minutos)",
      type: "number",
      initialValue: 5,
      validation: (rule) => rule.required().integer().min(1).max(60),
    }),
    defineField({
      name: "seoTitle",
      title: "Título para Google (opcional)",
      description: "Se ficar vazio, será usado o título do artigo.",
      type: "string",
      validation: (rule) => rule.max(65),
    }),
    defineField({
      name: "seoDescription",
      title: "Descrição para Google (opcional)",
      description: "Se ficar vazio, será usado o resumo.",
      type: "text",
      rows: 3,
      validation: (rule) => rule.max(160),
    }),
  ],
  orderings: [
    { title: "Mais recentes", name: "publishedAtDesc", by: [{ field: "publishedAt", direction: "desc" }] },
  ],
  preview: {
    select: { title: "title", subtitle: "category", media: "coverImage" },
  },
});
