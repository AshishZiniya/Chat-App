'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface Sticker {
    id: string;
    images: {
        fixed_height: {
            url: string;
        };
    };
    title: string;
}

interface StickerPickerProps {
    onStickerSelect: (stickerUrl: string) => void;
    isOpen: boolean;
    onClose: () => void;
}

export default function StickerPickerComponent({
    onStickerSelect,
    isOpen,
    onClose,
}: StickerPickerProps) {
    const [stickers, setStickers] = useState<Sticker[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchStickers = async (query: string = '') => {
        setLoading(true);
        try {
            const apiKey = process.env.NEXT_PUBLIC_GIPHY_API_KEY;
            const url = query
                ? `https://api.giphy.com/v1/stickers/search?api_key=${apiKey}&q=${encodeURIComponent(query)}&limit=20`
                : `https://api.giphy.com/v1/stickers/trending?api_key=${apiKey}&limit=20`;

            const response = await fetch(url);
            const data = await response.json();
            setStickers(data.data || []);
        } catch (error) {
            console.error('Error fetching stickers:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchStickers(searchTerm);
        }
    }, [isOpen, searchTerm]);

    if (!isOpen) return null;

    return (
        <div
            className="bg-white border border-gray-300 rounded-lg shadow-lg p-4 mx-auto"
            style={{ maxWidth: '320px', height: '400px' }}
        >
            <input
                type="text"
                placeholder="Search stickers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full mb-4 p-2 border border-gray-300 rounded"
            />
            <div className="overflow-auto h-80">
                {loading ? (
                    <div className="flex justify-center items-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-4 gap-2">
                        {stickers.map((sticker) => (
                            <button
                                key={sticker.id}
                                onClick={() => {
                                    onStickerSelect(
                                        sticker.images.fixed_height.url
                                    );
                                    onClose();
                                }}
                                className="p-2 hover:opacity-75 transition-opacity"
                            >
                                <Image
                                    src={sticker.images.fixed_height.url}
                                    alt={sticker.title}
                                    width={60}
                                    height={60}
                                    className="w-full h-full object-contain rounded"
                                    unoptimized
                                />
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
