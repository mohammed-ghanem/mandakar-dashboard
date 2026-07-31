import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ lang: string; id: string }>;
};

export default async function Page({ params }: Props) {
  const { lang, id } = await params;
  redirect(`/${lang}/lectures/categories/edit/${id}`);
}
