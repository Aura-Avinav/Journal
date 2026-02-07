import { useState, useEffect, useRef } from 'react';
import { User, Loader2, Upload } from 'lucide-react';
import { useStore } from '../../../hooks/useStore';
import { supabase } from '../../../lib/supabase';

export function AccountSettings() {
    const { session } = useStore();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [username, setUsername] = useState('');
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [originalUsername, setOriginalUsername] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const email = session?.user?.email || 'guest@example.com';
    const userId = session?.user?.id;

    // Load Profile
    useEffect(() => {
        if (!userId) return;

        const getProfile = async () => {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('profiles')
                    .select('username, avatar_url')
                    .eq('id', userId)
                    .single();

                if (error && error.code !== 'PGRST116') {
                    throw error;
                }

                if (data) {
                    setUsername(data.username || '');
                    setOriginalUsername(data.username || '');

                    if (data.avatar_url) {
                        // Check if it's a full URL (e.g. google auth) or a path
                        if (data.avatar_url.startsWith('http')) {
                            setAvatarUrl(data.avatar_url);
                        } else {
                            // Generate signed URL or public URL for storage path
                            const { data: publicUrlData } = supabase
                                .storage
                                .from('avatars')
                                .getPublicUrl(data.avatar_url);
                            setAvatarUrl(publicUrlData.publicUrl);
                        }
                    }
                }
            } catch (error) {
                console.error('Error loading profile:', error);
            } finally {
                setLoading(false);
            }
        };

        getProfile();
    }, [userId]);

    const handleUploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);

            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('You must select an image to upload.');
            }

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const filePath = `${userId}/${Math.random()}.${fileExt}`;

            // 1. Upload to Storage
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, { upsert: true });

            if (uploadError) throw uploadError;

            // 2. Update Profile with path
            const { error: updateError } = await supabase
                .from('profiles')
                .upsert({
                    id: userId,
                    avatar_url: filePath,
                    updated_at: new Date().toISOString(),
                });

            if (updateError) throw updateError;

            // 3. Update Local State
            const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
            setAvatarUrl(publicUrlData.publicUrl);

        } catch (error) {
            alert('Error uploading avatar!');
            console.error(error);
        } finally {
            setUploading(false);
        }
    };

    const updateProfile = async () => {
        try {
            setLoading(true);

            const { error } = await supabase.from('profiles').upsert({
                id: userId,
                username,
                updated_at: new Date().toISOString(),
            });

            if (error) throw error;

            setOriginalUsername(username);
            alert('Profile updated!');
        } catch (error) {
            alert('Error updating profile!');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const hasChanges = username !== originalUsername;

    return (
        <div className="space-y-6 max-w-2xl animate-in fade-in duration-300">
            <div>
                <h2 className="text-xl font-semibold text-foreground mb-1">My Account</h2>
                <p className="text-sm text-secondary">Manage your profile and account details.</p>
            </div>

            {/* Avatar Section */}
            <div className="flex items-center gap-6 py-4 border-b border-border/10">
                <div className="relative group">
                    <div className="w-20 h-20 rounded-full bg-surfaceHighlight overflow-hidden flex items-center justify-center text-3xl font-bold text-secondary border border-border/10">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <span>{email[0].toUpperCase()}</span>
                        )}
                        {uploading && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <Loader2 className="w-6 h-6 text-white animate-spin" />
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="font-medium text-foreground">Profile Photo</div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="text-sm px-3 py-1.5 bg-surfaceHighlight hover:bg-surfaceHighlight/80 text-foreground rounded-md transition-colors border border-border/10 flex items-center gap-2"
                        >
                            <Upload className="w-3.5 h-3.5" />
                            {uploading ? 'Uploading...' : 'Upload photo'}
                        </button>
                        <button
                            className="text-sm text-red-500 hover:text-red-400 hover:underline px-2"
                            onClick={async () => {
                                if (!window.confirm("Remove profile photo?")) return;
                                // Basic removal logic
                                await supabase.from('profiles').upsert({ id: userId, avatar_url: null, updated_at: new Date().toISOString() });
                                setAvatarUrl(null);
                            }}
                        >
                            Remove
                        </button>
                    </div>
                    <input
                        type="file"
                        id="avatar"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleUploadAvatar}
                        className="hidden"
                    />
                </div>
            </div>

            {/* Form Section */}
            <div className="space-y-6">
                <div className="grid gap-2">
                    <label className="text-sm font-medium text-secondary">Email</label>
                    <div className="flex items-center gap-2 p-2.5 bg-surfaceHighlight/30 rounded-lg border border-border/10 text-sm text-foreground">
                        <User className="w-4 h-4 text-secondary" />
                        {email}
                    </div>
                    <p className="text-xs text-secondary">Contact support to change email.</p>
                </div>

                <div className="grid gap-2">
                    <label className="text-sm font-medium text-secondary">Display Name</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter your name"
                        autoComplete="off"
                        className="w-full p-2.5 bg-surfaceHighlight/20 rounded-lg border border-border/10 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all placeholder:text-secondary/50"
                    />
                </div>

                {/* Action Buttons - Only visible if changes */}
                {hasChanges && (
                    <div className="flex items-center gap-3 pt-2 animate-in fade-in slide-in-from-top-2 duration-200">
                        <button
                            onClick={updateProfile}
                            disabled={loading}
                            className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading && <Loader2 className="w-3 h-3 animate-spin" />}
                            Save Changes
                        </button>
                        <button
                            onClick={() => setUsername(originalUsername)}
                            disabled={loading}
                            className="px-4 py-2 bg-transparent text-secondary hover:text-foreground text-sm font-medium rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
