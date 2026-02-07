import { User } from 'lucide-react';
import { useStore } from '../../../hooks/useStore';

export function AccountSettings() {
    // Force redeploy
    const { session } = useStore();
    const email = session?.user?.email || 'guest@example.com';

    return (
        <div className="space-y-6 max-w-2xl animate-in fade-in duration-300">
            <div>
                <h2 className="text-lg font-medium text-foreground mb-1">My Account</h2>
                <p className="text-sm text-secondary">Manage your profile and account details.</p>
            </div>

            <div className="flex items-center gap-4 py-4 border-b border-border/10">
                <div className="w-16 h-16 rounded-full bg-surfaceHighlight flex items-center justify-center text-2xl font-bold text-secondary">
                    {email[0].toUpperCase()}
                </div>
                <div>
                    <div className="font-medium text-foreground">Profile Photo</div>
                    <button className="text-xs text-accent hover:underline">Upload photo</button>
                </div>
            </div>

            <div className="space-y-4">
                <div className="grid gap-2">
                    <label className="text-sm font-medium text-secondary">Email</label>
                    <div className="flex items-center gap-2 p-2 bg-surfaceHighlight/30 rounded-md border border-border/10 text-sm text-foreground">
                        <User className="w-4 h-4 text-secondary" />
                        {email}
                    </div>
                    <p className="text-xs text-secondary">Contact support to change email.</p>
                </div>

                <div className="grid gap-2">
                    <label className="text-sm font-medium text-secondary">Name</label>
                    <input
                        type="text"
                        placeholder="Your Name"
                        className="w-full p-2 bg-surfaceHighlight/30 rounded-md border border-border/10 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                </div>
            </div>
        </div>
    );
}
