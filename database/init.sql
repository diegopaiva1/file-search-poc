-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum type for job status
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'job_status') THEN
        CREATE TYPE job_status AS ENUM ('pending', 'processing', 'completed', 'failed');
    END IF;
END $$;

-- Create files table
CREATE TABLE files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    size_bytes BIGINT NOT NULL,
    minio_path VARCHAR(500) NOT NULL,
    file_hash VARCHAR(64) NOT NULL UNIQUE,
    extracted_text TEXT,
    search_vector tsvector,
    latest_job_status job_status DEFAULT 'pending',
    latest_job_error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient searching
CREATE INDEX idx_files_search_vector ON files USING gin(search_vector);
CREATE INDEX idx_files_created_at ON files(created_at DESC);
CREATE INDEX idx_files_mime_type ON files(mime_type);
CREATE INDEX idx_files_hash ON files(file_hash);

-- Create trigger to automatically update search_vector when extracted_text changes
CREATE OR REPLACE FUNCTION update_search_vector()
RETURNS trigger AS $$
DECLARE
    filename TEXT;
BEGIN
    -- Remove file extension for better searchability
    filename := regexp_replace(NEW.original_name, '\.[^.]+$', '');
    NEW.search_vector := to_tsvector('english', COALESCE(filename, '') || ' ' || COALESCE(NEW.extracted_text, ''));
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER files_search_vector_update
    BEFORE INSERT OR UPDATE OF extracted_text, original_name
    ON files
    FOR EACH ROW
    EXECUTE FUNCTION update_search_vector();

-- Create file_processing_jobs table for async processing
CREATE TABLE file_processing_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_id UUID REFERENCES files(id) ON DELETE CASCADE,
    status job_status NOT NULL DEFAULT 'pending',
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_jobs_status ON file_processing_jobs(status);
CREATE INDEX idx_jobs_created_at ON file_processing_jobs(created_at DESC);