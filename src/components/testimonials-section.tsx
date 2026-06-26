"use client";
import { cn } from "@/lib/utils";
import { InfiniteSlider } from "@/components/infinite-slider";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@/components/ui/avatar";

type Testimonial = {
	quote: string;
	image: string;
	name: string;
	role: string;
	company?: string;
};

const testimonials: Testimonial[] = [
	{
		quote: "Sribuai APIRouter menghemat banyak waktu saya. Satu API key untuk semua model AI, tinggal pakai langsung di project.",
		image: "https://api.dicebear.com/7.x/avataaars/svg?seed=andi",
		name: "Andi Pratama",
		role: "Full Stack Developer",
		company: "Freelance",
	},
	{
		quote: "Bayar pakai QRIS tanpa kartu kredit internasional itu game changer banget. Akhirnya bisa akses Claude dan GPT-4 dengan mudah.",
		image: "https://api.dicebear.com/7.x/avataaars/svg?seed=sari",
		name: "Sari Dewi",
		role: "AI Engineer",
		company: "Startup Bandung",
	},
	{
		quote: "Dashboard realtime-nya sangat membantu untuk monitoring penggunaan API tim kami. Admin control-nya lengkap dan mudah digunakan.",
		image: "https://api.dicebear.com/7.x/avataaars/svg?seed=budi",
		name: "Budi Santoso",
		role: "CTO",
		company: "PT Teknologi Maju",
	},
	{
		quote: "Integrasi ke aplikasi existing kami cuma butuh ganti base URL. OpenAI-compatible benar-benar mempermudah migrasi.",
		image: "https://api.dicebear.com/7.x/avataaars/svg?seed=rina",
		name: "Rina Kusuma",
		role: "Backend Developer",
		company: "Agency Digital",
	},
	{
		quote: "Paket harian sangat cocok untuk eksperimen dan riset. Tidak perlu komitmen bulanan, hemat banget untuk mahasiswa seperti saya.",
		image: "https://api.dicebear.com/7.x/avataaars/svg?seed=fajar",
		name: "Fajar Nugroho",
		role: "Mahasiswa",
		company: "Universitas Indonesia",
	},
	{
		quote: "Support Bahasa Indonesia-nya top. Tim support responsif dan dokumentasinya mudah dipahami meski baru pertama kali pakai AI API.",
		image: "https://api.dicebear.com/7.x/avataaars/svg?seed=maya",
		name: "Maya Anggraini",
		role: "Product Manager",
		company: "SaaS Indonesia",
	},
	{
		quote: "Dengan 37+ model tersedia, saya bisa pilih model yang paling sesuai kebutuhan dan budget project klien.",
		image: "https://api.dicebear.com/7.x/avataaars/svg?seed=dimas",
		name: "Dimas Firdaus",
		role: "Software Engineer",
		company: "Konsultan IT",
	},
	{
		quote: "Harga yang terjangkau dengan kualitas setara provider internasional. Sribuai jadi pilihan utama tim kami untuk semua kebutuhan AI.",
		image: "https://api.dicebear.com/7.x/avataaars/svg?seed=lina",
		name: "Lina Halim",
		role: "Lead Developer",
		company: "E-commerce Lokal",
	},
	{
		quote: "Latency-nya rendah dan uptime-nya stabil. Sudah 3 bulan pakai Sribuai, belum pernah ada masalah berarti di production.",
		image: "https://api.dicebear.com/7.x/avataaars/svg?seed=hendra",
		name: "Hendra Wijaya",
		role: "DevOps Engineer",
		company: "Fintech Startup",
	},
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

export function TestimonialsSection() {
	return (
		<section className="relative py-16">
			<div className="mx-auto max-w-6xl px-4">
				<div className="mb-10 flex flex-col items-center gap-3 text-center">
					<div className="rounded-lg border px-4 py-1 text-sm">Testimoni</div>
					<h2 className="font-bold text-3xl tracking-tighter lg:text-4xl">
						Apa kata <span className="font-serif">pengguna kami</span>
					</h2>
					<p className="text-center text-muted-foreground text-sm">
						Dipercaya oleh <span className="font-serif">developer Indonesia</span> untuk kebutuhan AI mereka.
					</p>
				</div>

				<div
					className="flex justify-center gap-4 overflow-hidden"
					style={{
						height: "560px",
						maskImage: "linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)",
						WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)",
					}}
				>
					<InfiniteSlider direction="vertical" speed={25} speedOnHover={10}>
						{firstColumn.map((testimonial) => (
							<TestimonialsCard key={testimonial.name} testimonial={testimonial} />
						))}
					</InfiniteSlider>
					<InfiniteSlider
						className="hidden md:block"
						direction="vertical"
						speed={35}
						speedOnHover={15}
					>
						{secondColumn.map((testimonial) => (
							<TestimonialsCard key={testimonial.name} testimonial={testimonial} />
						))}
					</InfiniteSlider>
					<InfiniteSlider
						className="hidden lg:block"
						direction="vertical"
						speed={20}
						speedOnHover={8}
					>
						{thirdColumn.map((testimonial) => (
							<TestimonialsCard key={testimonial.name} testimonial={testimonial} />
						))}
					</InfiniteSlider>
				</div>
			</div>
		</section>
	);
}

function TestimonialsCard({
	testimonial,
	className,
	...props
}: React.ComponentProps<"figure"> & {
	testimonial: Testimonial;
}) {
	const { quote, image, name, role, company } = testimonial;
	return (
		<figure
			className={cn(
				"w-72 rounded-xl border bg-card p-5 shadow-sm",
				className
			)}
			{...props}
		>
			<blockquote className="text-sm leading-relaxed">{quote}</blockquote>
			<figcaption className="mt-4 flex items-center gap-3">
				<Avatar className="size-9 shrink-0">
					<AvatarImage alt={`${name}'s profile picture`} src={image} />
					<AvatarFallback>{name.charAt(0)}</AvatarFallback>
				</Avatar>
				<div className="flex min-w-0 flex-col">
					<cite className="font-medium not-italic text-sm leading-tight">{name}</cite>
					<span className="truncate text-muted-foreground text-xs leading-tight">
						{role}{company && `, ${company}`}
					</span>
				</div>
			</figcaption>
		</figure>
	);
}
