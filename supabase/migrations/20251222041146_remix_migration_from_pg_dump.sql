CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql" WITH SCHEMA "pg_catalog";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
BEGIN;

--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'admin',
    'user'
);


--
-- Name: equipment_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.equipment_status AS ENUM (
    'available',
    'rented',
    'maintenance'
);


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    NEW.email
  );
  RETURN NEW;
END;
$$;


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: blog_articles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.blog_articles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    title_en text,
    slug text NOT NULL,
    category_id uuid,
    author_id uuid,
    content text NOT NULL,
    excerpt text,
    image_url text,
    featured boolean DEFAULT false,
    published boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: blog_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.blog_categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    name_en text,
    slug text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    name_en text NOT NULL,
    slug text NOT NULL,
    description text,
    icon text,
    order_index integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: contact_info; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contact_info (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    whatsapp text,
    email text,
    phone text,
    address text,
    instagram text,
    facebook text,
    quote_message text,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    instagram_token text
);


--
-- Name: equipment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.equipment (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    name_en text,
    category_id uuid,
    brand text,
    model text,
    description text,
    specs jsonb DEFAULT '[]'::jsonb,
    price_per_day integer NOT NULL,
    price_per_week integer,
    status public.equipment_status DEFAULT 'available'::public.equipment_status,
    image_url text,
    tags text[] DEFAULT ARRAY[]::text[],
    featured boolean DEFAULT false,
    order_index integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    subcategory_id uuid,
    images jsonb DEFAULT '[]'::jsonb,
    detailed_description text,
    detailed_specs jsonb DEFAULT '[]'::jsonb,
    featured_copy text
);


--
-- Name: equipment_availability; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.equipment_availability (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    equipment_id uuid NOT NULL,
    date date NOT NULL,
    status text DEFAULT 'available'::text,
    quantity_available integer DEFAULT 1,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT equipment_availability_quantity_available_check CHECK ((quantity_available >= 0)),
    CONSTRAINT equipment_availability_status_check CHECK ((status = ANY (ARRAY['available'::text, 'booked'::text, 'maintenance'::text])))
);


--
-- Name: equipment_recommendations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.equipment_recommendations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    equipment_id uuid NOT NULL,
    recommended_id uuid NOT NULL,
    score numeric(3,2) DEFAULT 0.5,
    reason text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT equipment_recommendations_score_check CHECK (((score >= (0)::numeric) AND (score <= (1)::numeric)))
);


--
-- Name: equipment_unavailability; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.equipment_unavailability (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    equipment_id uuid NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT valid_date_range CHECK ((end_date >= start_date))
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    display_name text,
    email text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: quote_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quote_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    quote_id uuid NOT NULL,
    equipment_id uuid,
    equipment_name text NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    days integer DEFAULT 1 NOT NULL,
    price_per_day integer NOT NULL,
    subtotal integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: quotes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quotes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    client_name text NOT NULL,
    client_email text NOT NULL,
    client_phone text NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    comments text,
    total_amount integer DEFAULT 0,
    status text DEFAULT 'pending'::text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: reservations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reservations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    equipment_id uuid NOT NULL,
    user_id uuid,
    start_date date NOT NULL,
    end_date date NOT NULL,
    status text DEFAULT 'pending'::text,
    total_price integer NOT NULL,
    quantity integer DEFAULT 1,
    customer_name text,
    customer_email text,
    customer_phone text,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT reservations_check CHECK ((end_date > start_date)),
    CONSTRAINT reservations_quantity_check CHECK ((quantity > 0)),
    CONSTRAINT reservations_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'confirmed'::text, 'cancelled'::text, 'completed'::text])))
);


--
-- Name: space_unavailability; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.space_unavailability (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    space_id uuid NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: spaces; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.spaces (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    detailed_description text,
    price integer NOT NULL,
    promotion text,
    images jsonb DEFAULT '[]'::jsonb,
    amenities jsonb DEFAULT '[]'::jsonb,
    specs jsonb DEFAULT '{}'::jsonb,
    status text DEFAULT 'available'::text,
    order_index integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: subcategories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subcategories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    category_id uuid NOT NULL,
    name text NOT NULL,
    name_en text,
    slug text NOT NULL,
    description text,
    order_index integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: blog_articles blog_articles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_articles
    ADD CONSTRAINT blog_articles_pkey PRIMARY KEY (id);


--
-- Name: blog_articles blog_articles_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_articles
    ADD CONSTRAINT blog_articles_slug_key UNIQUE (slug);


--
-- Name: blog_categories blog_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_categories
    ADD CONSTRAINT blog_categories_pkey PRIMARY KEY (id);


--
-- Name: blog_categories blog_categories_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_categories
    ADD CONSTRAINT blog_categories_slug_key UNIQUE (slug);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: categories categories_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_key UNIQUE (slug);


--
-- Name: contact_info contact_info_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contact_info
    ADD CONSTRAINT contact_info_pkey PRIMARY KEY (id);


--
-- Name: equipment_availability equipment_availability_equipment_id_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment_availability
    ADD CONSTRAINT equipment_availability_equipment_id_date_key UNIQUE (equipment_id, date);


--
-- Name: equipment_availability equipment_availability_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment_availability
    ADD CONSTRAINT equipment_availability_pkey PRIMARY KEY (id);


--
-- Name: equipment equipment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment
    ADD CONSTRAINT equipment_pkey PRIMARY KEY (id);


--
-- Name: equipment_recommendations equipment_recommendations_equipment_id_recommended_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment_recommendations
    ADD CONSTRAINT equipment_recommendations_equipment_id_recommended_id_key UNIQUE (equipment_id, recommended_id);


--
-- Name: equipment_recommendations equipment_recommendations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment_recommendations
    ADD CONSTRAINT equipment_recommendations_pkey PRIMARY KEY (id);


--
-- Name: equipment_unavailability equipment_unavailability_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment_unavailability
    ADD CONSTRAINT equipment_unavailability_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: quote_items quote_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_items
    ADD CONSTRAINT quote_items_pkey PRIMARY KEY (id);


--
-- Name: quotes quotes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quotes
    ADD CONSTRAINT quotes_pkey PRIMARY KEY (id);


--
-- Name: reservations reservations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_pkey PRIMARY KEY (id);


--
-- Name: space_unavailability space_unavailability_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.space_unavailability
    ADD CONSTRAINT space_unavailability_pkey PRIMARY KEY (id);


--
-- Name: spaces spaces_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.spaces
    ADD CONSTRAINT spaces_pkey PRIMARY KEY (id);


--
-- Name: spaces spaces_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.spaces
    ADD CONSTRAINT spaces_slug_key UNIQUE (slug);


--
-- Name: subcategories subcategories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subcategories
    ADD CONSTRAINT subcategories_pkey PRIMARY KEY (id);


--
-- Name: subcategories subcategories_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subcategories
    ADD CONSTRAINT subcategories_slug_key UNIQUE (slug);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: idx_equipment_availability_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_equipment_availability_date ON public.equipment_availability USING btree (date);


--
-- Name: idx_equipment_availability_equipment_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_equipment_availability_equipment_date ON public.equipment_availability USING btree (equipment_id, date);


--
-- Name: idx_equipment_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_equipment_category ON public.equipment USING btree (category_id);


--
-- Name: idx_equipment_featured; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_equipment_featured ON public.equipment USING btree (featured);


--
-- Name: idx_equipment_recommendations_equipment; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_equipment_recommendations_equipment ON public.equipment_recommendations USING btree (equipment_id);


--
-- Name: idx_equipment_search; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_equipment_search ON public.equipment USING gin (to_tsvector('spanish'::regconfig, ((((name || ' '::text) || COALESCE(brand, ''::text)) || ' '::text) || COALESCE(model, ''::text))));


--
-- Name: idx_equipment_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_equipment_status ON public.equipment USING btree (status);


--
-- Name: idx_equipment_unavailability_dates; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_equipment_unavailability_dates ON public.equipment_unavailability USING btree (start_date, end_date);


--
-- Name: idx_equipment_unavailability_equipment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_equipment_unavailability_equipment_id ON public.equipment_unavailability USING btree (equipment_id);


--
-- Name: idx_quote_items_equipment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_quote_items_equipment_id ON public.quote_items USING btree (equipment_id);


--
-- Name: idx_quote_items_quote_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_quote_items_quote_id ON public.quote_items USING btree (quote_id);


--
-- Name: idx_quotes_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_quotes_user_id ON public.quotes USING btree (user_id);


--
-- Name: idx_reservations_dates; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reservations_dates ON public.reservations USING btree (start_date, end_date);


--
-- Name: idx_reservations_equipment; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reservations_equipment ON public.reservations USING btree (equipment_id);


--
-- Name: idx_reservations_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reservations_user ON public.reservations USING btree (user_id);


--
-- Name: idx_space_unavailability_dates; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_space_unavailability_dates ON public.space_unavailability USING btree (start_date, end_date);


--
-- Name: idx_space_unavailability_space_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_space_unavailability_space_id ON public.space_unavailability USING btree (space_id);


--
-- Name: blog_articles update_blog_articles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_blog_articles_updated_at BEFORE UPDATE ON public.blog_articles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: blog_categories update_blog_categories_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_blog_categories_updated_at BEFORE UPDATE ON public.blog_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: categories update_categories_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: equipment_availability update_equipment_availability_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_equipment_availability_updated_at BEFORE UPDATE ON public.equipment_availability FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: equipment update_equipment_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_equipment_updated_at BEFORE UPDATE ON public.equipment FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: quotes update_quotes_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON public.quotes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: reservations update_reservations_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON public.reservations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: space_unavailability update_space_unavailability_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_space_unavailability_updated_at BEFORE UPDATE ON public.space_unavailability FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: spaces update_spaces_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_spaces_updated_at BEFORE UPDATE ON public.spaces FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: subcategories update_subcategories_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_subcategories_updated_at BEFORE UPDATE ON public.subcategories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: blog_articles blog_articles_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_articles
    ADD CONSTRAINT blog_articles_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: blog_articles blog_articles_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_articles
    ADD CONSTRAINT blog_articles_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.blog_categories(id) ON DELETE SET NULL;


--
-- Name: equipment_availability equipment_availability_equipment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment_availability
    ADD CONSTRAINT equipment_availability_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipment(id) ON DELETE CASCADE;


--
-- Name: equipment equipment_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment
    ADD CONSTRAINT equipment_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;


--
-- Name: equipment_recommendations equipment_recommendations_equipment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment_recommendations
    ADD CONSTRAINT equipment_recommendations_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipment(id) ON DELETE CASCADE;


--
-- Name: equipment_recommendations equipment_recommendations_recommended_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment_recommendations
    ADD CONSTRAINT equipment_recommendations_recommended_id_fkey FOREIGN KEY (recommended_id) REFERENCES public.equipment(id) ON DELETE CASCADE;


--
-- Name: equipment equipment_subcategory_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment
    ADD CONSTRAINT equipment_subcategory_id_fkey FOREIGN KEY (subcategory_id) REFERENCES public.subcategories(id);


--
-- Name: equipment_unavailability equipment_unavailability_equipment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment_unavailability
    ADD CONSTRAINT equipment_unavailability_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipment(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: quote_items quote_items_equipment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_items
    ADD CONSTRAINT quote_items_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipment(id) ON DELETE SET NULL;


--
-- Name: quote_items quote_items_quote_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_items
    ADD CONSTRAINT quote_items_quote_id_fkey FOREIGN KEY (quote_id) REFERENCES public.quotes(id) ON DELETE CASCADE;


--
-- Name: quotes quotes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quotes
    ADD CONSTRAINT quotes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: reservations reservations_equipment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipment(id) ON DELETE CASCADE;


--
-- Name: reservations reservations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: space_unavailability space_unavailability_space_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.space_unavailability
    ADD CONSTRAINT space_unavailability_space_id_fkey FOREIGN KEY (space_id) REFERENCES public.spaces(id) ON DELETE CASCADE;


--
-- Name: subcategories subcategories_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subcategories
    ADD CONSTRAINT subcategories_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: profiles Admins can manage all profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all profiles" ON public.profiles USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: quote_items Admins can manage all quote items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all quote items" ON public.quote_items USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: reservations Admins can manage all reservations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all reservations" ON public.reservations USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Admins can manage all roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all roles" ON public.user_roles USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: equipment_availability Admins can manage availability; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage availability" ON public.equipment_availability USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: blog_articles Admins can manage blog articles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage blog articles" ON public.blog_articles USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: blog_categories Admins can manage blog categories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage blog categories" ON public.blog_categories USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: categories Admins can manage categories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage categories" ON public.categories USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: contact_info Admins can manage contact info; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage contact info" ON public.contact_info USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: equipment Admins can manage equipment; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage equipment" ON public.equipment USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: equipment_recommendations Admins can manage recommendations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage recommendations" ON public.equipment_recommendations USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: space_unavailability Admins can manage space unavailability periods; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage space unavailability periods" ON public.space_unavailability USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: spaces Admins can manage spaces; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage spaces" ON public.spaces USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: subcategories Admins can manage subcategories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage subcategories" ON public.subcategories USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: equipment_unavailability Admins can manage unavailability periods; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage unavailability periods" ON public.equipment_unavailability USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: quotes Admins can update quotes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update quotes" ON public.quotes FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: blog_articles Admins can view all articles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all articles" ON public.blog_articles FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: quotes Admins can view all quotes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all quotes" ON public.quotes FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: equipment_availability Availability is viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Availability is viewable by everyone" ON public.equipment_availability FOR SELECT USING (true);


--
-- Name: blog_categories Blog categories are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Blog categories are viewable by everyone" ON public.blog_categories FOR SELECT USING (true);


--
-- Name: categories Categories are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);


--
-- Name: contact_info Contact info is viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Contact info is viewable by everyone" ON public.contact_info FOR SELECT USING (true);


--
-- Name: equipment Equipment is viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Equipment is viewable by everyone" ON public.equipment FOR SELECT USING (true);


--
-- Name: blog_articles Published articles are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Published articles are viewable by everyone" ON public.blog_articles FOR SELECT USING ((published = true));


--
-- Name: equipment_recommendations Recommendations are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Recommendations are viewable by everyone" ON public.equipment_recommendations FOR SELECT USING (true);


--
-- Name: space_unavailability Space unavailability periods are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Space unavailability periods are viewable by everyone" ON public.space_unavailability FOR SELECT USING (true);


--
-- Name: spaces Spaces are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Spaces are viewable by everyone" ON public.spaces FOR SELECT USING (true);


--
-- Name: subcategories Subcategories are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Subcategories are viewable by everyone" ON public.subcategories FOR SELECT USING (true);


--
-- Name: equipment_unavailability Unavailability periods are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Unavailability periods are viewable by everyone" ON public.equipment_unavailability FOR SELECT USING (true);


--
-- Name: quotes Users can create quotes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create quotes" ON public.quotes FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: reservations Users can create reservations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create reservations" ON public.reservations FOR INSERT WITH CHECK (((auth.uid() = user_id) OR (auth.uid() IS NULL)));


--
-- Name: quote_items Users can insert quote items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert quote items" ON public.quote_items FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.quotes
  WHERE ((quotes.id = quote_items.quote_id) AND (quotes.user_id = auth.uid())))));


--
-- Name: profiles Users can update their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = id));


--
-- Name: reservations Users can update their own reservations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own reservations" ON public.reservations FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: profiles Users can view their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING ((auth.uid() = id));


--
-- Name: quote_items Users can view their own quote items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own quote items" ON public.quote_items FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.quotes
  WHERE ((quotes.id = quote_items.quote_id) AND (quotes.user_id = auth.uid())))));


--
-- Name: quotes Users can view their own quotes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own quotes" ON public.quotes FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: reservations Users can view their own reservations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own reservations" ON public.reservations FOR SELECT USING (((auth.uid() = user_id) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: user_roles Users can view their own roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: blog_articles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.blog_articles ENABLE ROW LEVEL SECURITY;

--
-- Name: blog_categories; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;

--
-- Name: categories; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

--
-- Name: contact_info; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.contact_info ENABLE ROW LEVEL SECURITY;

--
-- Name: equipment; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;

--
-- Name: equipment_availability; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.equipment_availability ENABLE ROW LEVEL SECURITY;

--
-- Name: equipment_recommendations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.equipment_recommendations ENABLE ROW LEVEL SECURITY;

--
-- Name: equipment_unavailability; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.equipment_unavailability ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: quote_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;

--
-- Name: quotes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

--
-- Name: reservations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

--
-- Name: space_unavailability; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.space_unavailability ENABLE ROW LEVEL SECURITY;

--
-- Name: spaces; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.spaces ENABLE ROW LEVEL SECURITY;

--
-- Name: subcategories; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--




COMMIT;