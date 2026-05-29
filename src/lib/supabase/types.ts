/**
 * Tipi DB Supabase — versione minima Sprint 1.
 *
 * Coprono solo le tabelle effettivamente usate dal codice di Sprint 1
 * (waitlist, events). Le altre tabelle esistono nello schema SQL ma non
 * vengono ancora interrogate da codice tipizzato.
 *
 * Sprint 2: rigenerare tutti i tipi dal DB:
 *   pnpm dlx supabase gen types typescript \
 *     --project-id <project_id> --schema public > src/lib/supabase/types.ts
 *
 * NOTA: `Relationships: []` è richiesto da `GenericTable` di postgrest-js
 * (vedi `node_modules/.../postgrest-js/.../types/common/common.ts`).
 *
 * Riferimento brief §9.
 */

export type Json = string | number | boolean | null | { [k: string]: Json } | Json[];

export type Database = {
  public: {
    Tables: {
      waitlist: {
        Row: {
          id: string;
          email: string;
          language: 'it' | 'es' | 'en' | 'ca' | null;
          role: 'worker' | 'employer' | null;
          source: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          language?: 'it' | 'es' | 'en' | 'ca' | null;
          role?: 'worker' | 'employer' | null;
          source?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          language?: 'it' | 'es' | 'en' | 'ca' | null;
          role?: 'worker' | 'employer' | null;
          source?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      events: {
        Row: {
          id: string;
          user_id: string | null;
          event_type: string;
          payload: Json;
          session_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          event_type: string;
          payload?: Json;
          session_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          event_type?: string;
          payload?: Json;
          session_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      partners: {
        Row: {
          id: string;
          ragione_sociale: string;
          tipo_partner:
            | 'consulente_lavoro'
            | 'agenzia_recruiting'
            | 'agenzia_somministrazione'
            | 'gestoria'
            | 'portale_recruiting'
            | 'altro';
          territorio: string | null;
          p_iva: string | null;
          nome_contatto: string;
          email: string;
          telefono: string | null;
          sito_web: string | null;
          note: string | null;
          stato: 'nuovo' | 'contattato' | 'in_trattativa' | 'chiuso';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          ragione_sociale: string;
          tipo_partner:
            | 'consulente_lavoro'
            | 'agenzia_recruiting'
            | 'agenzia_somministrazione'
            | 'gestoria'
            | 'portale_recruiting'
            | 'altro';
          territorio?: string | null;
          p_iva?: string | null;
          nome_contatto: string;
          email: string;
          telefono?: string | null;
          sito_web?: string | null;
          note?: string | null;
          // Default DB 'nuovo'. Il form pubblico NON deve passare questo campo.
          stato?: 'nuovo' | 'contattato' | 'in_trattativa' | 'chiuso';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          ragione_sociale?: string;
          tipo_partner?:
            | 'consulente_lavoro'
            | 'agenzia_recruiting'
            | 'agenzia_somministrazione'
            | 'gestoria'
            | 'portale_recruiting'
            | 'altro';
          territorio?: string | null;
          p_iva?: string | null;
          nome_contatto?: string;
          email?: string;
          telefono?: string | null;
          sito_web?: string | null;
          note?: string | null;
          stato?: 'nuovo' | 'contattato' | 'in_trattativa' | 'chiuso';
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
