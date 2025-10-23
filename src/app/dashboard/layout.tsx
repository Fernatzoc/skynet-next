import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Dashboard - SkyNet",
    description: "Panel de administración de SkyNet",
};

export default function DashboardRootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
