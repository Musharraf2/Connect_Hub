"use client"

import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { uploadVoiceMessage } from '@/lib/chat-api';
import { Mic, Square, Send, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface VoiceRecorderProps {
  onUpload: (url: string) => void;
  onClose: () => void;
}

export default function VoiceRecorder({ onUpload, onClose }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Failed to start recording:', error);
      toast.error('Failed to access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const handleUpload = async () => {
    if (!audioBlob) return;

    setUploading(true);
    const toastId = toast.loading('Uploading voice message...');

    try {
      const result = await uploadVoiceMessage(audioBlob);
      toast.success('Voice message sent!', { id: toastId });
      onUpload(result.url);
    } catch (error) {
      console.error('Failed to upload voice message:', error);
      toast.error('Failed to upload voice message', { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Voice Message</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!audioBlob ? (
            <div className="text-center py-8">
              <div className="mb-4">
                <Button
                  size="lg"
                  variant={isRecording ? 'destructive' : 'default'}
                  className="rounded-full w-20 h-20"
                  onClick={isRecording ? stopRecording : startRecording}
                >
                  {isRecording ? (
                    <Square className="w-8 h-8" />
                  ) : (
                    <Mic className="w-8 h-8" />
                  )}
                </Button>
              </div>
              
              {isRecording && (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
                    <span className="text-sm font-medium">
                      Recording... {formatTime(recordingTime)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Click the button to stop recording
                  </p>
                </div>
              )}
              
              {!isRecording && (
                <p className="text-sm text-muted-foreground">
                  Click the microphone to start recording
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <audio controls className="w-full">
                  <source src={audioUrl} type="audio/webm" />
                  Your browser does not support the audio element.
                </audio>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setAudioBlob(null);
                    setAudioUrl('');
                    setRecordingTime(0);
                  }}
                  className="flex-1"
                  disabled={uploading}
                >
                  <X className="w-4 h-4 mr-2" />
                  Discard
                </Button>
                <Button
                  onClick={handleUpload}
                  className="flex-1"
                  disabled={uploading}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {uploading ? 'Sending...' : 'Send'}
                </Button>
              </div>
            </div>
          )}

          {!audioBlob && !isRecording && (
            <Button variant="outline" onClick={onClose} className="w-full">
              Cancel
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
