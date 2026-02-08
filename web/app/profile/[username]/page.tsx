import ProfilePageContent from '@/components/ProfilePageContent';

export function generateStaticParams() {
    return [{ username: 'user' }];
}

export default async function ProfilePage({ params }: { params: any }) {
    // Await params for Next.js 15/16 compatibility
    const resolvedParams = await params;
    return <ProfilePageContent />;
}
