import { supabase } from './db';

export interface NoteVersion {
  id: string;
  noteId: string;
  userId: string;
  title: string;
  content: string;
  format: string;
  versionNumber: number;
  isProcessed: boolean;
  processingMetadata?: {
    model?: string;
    promptType?: string;
    provider?: string;
    temperature?: number;
  };
  createdAt: string;
}

export interface CreateNoteVersionData {
  noteId: string;
  userId: string;
  title: string;
  content: string;
  format: string;
  isProcessed?: boolean;
  processingMetadata?: {
    model?: string;
    promptType?: string;
    provider?: string;
    temperature?: number;
  };
}

export class NoteVersionService {
  private static instance: NoteVersionService;

  private constructor() {}

  public static getInstance(): NoteVersionService {
    if (!NoteVersionService.instance) {
      NoteVersionService.instance = new NoteVersionService();
    }
    return NoteVersionService.instance;
  }

  /**
   * Create a new version of a note
   */
  public async createVersion(data: CreateNoteVersionData): Promise<NoteVersion> {
    try {
      // Get the next version number for this note
      const { data: existingVersions, error: countError } = await supabase
        .from('note_versions')
        .select('version_number')
        .eq('note_id', data.noteId)
        .order('version_number', { ascending: false })
        .limit(1);

      if (countError) {
        console.error('Error getting version count:', countError);
        throw countError;
      }

      const nextVersionNumber = existingVersions && existingVersions.length > 0
        ? existingVersions[0].version_number + 1
        : 1;

      // Create the new version
      const { data: version, error } = await supabase
        .from('note_versions')
        .insert([{
          note_id: data.noteId,
          user_id: data.userId,
          title: data.title,
          content: data.content,
          format: data.format,
          version_number: nextVersionNumber,
          is_processed: data.isProcessed || false,
          processing_metadata: data.processingMetadata || null
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating note version:', error);
        throw error;
      }

      return this.mapToNoteVersion(version);
    } catch (error) {
      console.error('Error in createVersion:', error);
      throw error;
    }
  }

  /**
   * Get all versions for a specific note
   */
  public async getVersionsByNoteId(noteId: string, userId: string): Promise<NoteVersion[]> {
    try {
      const { data: versions, error } = await supabase
        .from('note_versions')
        .select('*')
        .eq('note_id', noteId)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching note versions:', error);
        throw error;
      }

      return versions ? versions.map((v: any) => this.mapToNoteVersion(v)) : [];
    } catch (error) {
      console.error('Error in getVersionsByNoteId:', error);
      throw error;
    }
  }

  /**
   * Get a specific version by ID
   */
  public async getVersionById(id: string, userId: string): Promise<NoteVersion | null> {
    try {
      const { data: version, error } = await supabase
        .from('note_versions')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Error fetching note version:', error);
        throw error;
      }

      return version ? this.mapToNoteVersion(version) : null;
    } catch (error) {
      console.error('Error in getVersionById:', error);
      throw error;
    }
  }

  /**
   * Delete a specific version
   */
  public async deleteVersion(id: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('note_versions')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting note version:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in deleteVersion:', error);
      throw error;
    }
  }

  /**
   * Delete all versions for a note
   */
  public async deleteVersionsByNoteId(noteId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('note_versions')
        .delete()
        .eq('note_id', noteId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting note versions:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in deleteVersionsByNoteId:', error);
      throw error;
    }
  }

  /**
   * Get the latest N versions for a note
   */
  public async getLatestVersions(noteId: string, userId: string, limit: number = 10): Promise<NoteVersion[]> {
    try {
      const { data: versions, error } = await supabase
        .from('note_versions')
        .select('*')
        .eq('note_id', noteId)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching latest note versions:', error);
        throw error;
      }

      return versions ? versions.map((v: any) => this.mapToNoteVersion(v)) : [];
    } catch (error) {
      console.error('Error in getLatestVersions:', error);
      throw error;
    }
  }

  /**
   * Map database row to NoteVersion interface
   */
  private mapToNoteVersion(row: any): NoteVersion {
    return {
      id: row.id,
      noteId: row.note_id,
      userId: row.user_id,
      title: row.title,
      content: row.content,
      format: row.format,
      versionNumber: row.version_number,
      isProcessed: row.is_processed,
      processingMetadata: row.processing_metadata,
      createdAt: row.created_at
    };
  }
}
