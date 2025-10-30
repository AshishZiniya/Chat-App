'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface Gif {
  id: string;
  images: {
    fixed_height: {
      url: string;
    };
  };
  title: string;
}

interface GifPickerProps {
  onGifSelect: (gifUrl: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function GifPickerComponent({ onGifSelect, isOpen, onClose }: GifPickerProps) {
  const [gifs, setGifs] = useState<Gif[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchGifs = async (query: string = '') => {
    setLoading(true);
    try {
      const apiKey = process.env.NEXT_PUBLIC_GIPHY_API_KEY;
      const url = query
        ? `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(query)}&limit=20`
        : `https://api.giphy.com/v1/gifs/trending?api_key=${apiKey}&limit=20`;

      const response = await fetch(url);
      const data = await response.json();
      setGifs(data.data || []);
    } catch (error) {
      console.error('Error fetching GIFs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchGifs(searchTerm);
    }
  }, [isOpen, searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-4 mx-auto" style={{ maxWidth: '320px', height: '400px' }}>
      <input
        type="text"
        placeholder="Search GIFs..."
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
          <div className="grid grid-cols-3 gap-2">
            {gifs.map((gif) => (
              <button
                key={gif.id}
                onClick={() => {
                  onGifSelect(gif.images.fixed_height.url);
                  onClose();
                }}
                className="hover:opacity-75 transition-opacity"
              >
                <Image
                  src={gif.images.fixed_height.url}
                  alt={gif.title}
                  width={100}
                  height={100}
                  className="w-full h-full object-cover rounded"
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