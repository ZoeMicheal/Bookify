import { auth } from "@clerk/nextjs/server";
import { getBookBySlug } from "@/lib/actions/book.actions";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, MicOff, Mic } from "lucide-react";
import VapiControls from "@/components/VapiControls";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function BookDetailsPage({ params }: Props) {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const { slug } = await params;
  const result = await getBookBySlug(slug);

  if (!result.success || !result.data) {
    redirect("/");
  }

  const book = result.data;

  return (
    <main className="book-page-container">
      <Link href="/" className="back-btn-floating">
        <ArrowLeft className="w-6 h-6 text-[#212a3b]" />
      </Link>
        <VapiControls book={book} />
    </main>
  );
}
