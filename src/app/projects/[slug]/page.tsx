"use client";

import Layout1 from '@/components/layout/Layout1';
import { api } from '@/api/axios';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { MdArrowBack, MdLocationOn, MdBusiness } from 'react-icons/md';
import { Skeleton } from '@/components/ui/skeleton/Skeleton';
import { Button } from '@/components/ui/button/Button';
import Image from 'next/image';

type Project = {
    _id: string;
    title: string;
    slug: string;
    description: string;
    fullDescription?: string;
    category: string;
    image: string;
    images?: string[];
    client?: string;
    location?: string;
    technologies?: string[];
    results?: string[];
};

export default function ProjectDetailPage() {
    const params = useParams();
    const slug = params.slug as string;
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const res = await api.get(`/project/slug/${slug}`);
                setProject(res.data.project);
            } catch (error) {
                console.error('Failed to load project');
            } finally {
                setLoading(false);
            }
        };
        if (slug) fetchProject();
    }, [slug]);

    if (loading) {
        return (
            <Layout1>
                <div className="min-h-screen custom-black-white-theme-switch-bg section-spacing">
                    <div className="page-container">
                        <Skeleton height={40} width={200} className="mb-8" />
                        <Skeleton height={400} className="mb-8 rounded-2xl" />
                        <Skeleton height={60} className="mb-6" />
                        <Skeleton height={200} className="mb-8" />
                    </div>
                </div>
            </Layout1>
        );
    }

    if (!project) {
        return (
            <Layout1>
                <div className="min-h-screen custom-black-white-theme-switch-bg section-spacing">
                    <div className="page-container text-center">
                        <div className="max-w-md mx-auto py-12">
                            <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                                <MdArrowBack size={40} className="text-gray-400" />
                            </div>
                            <h1 className="text-3xl font-bold custom-black-white-theme-switch-text mb-4">
                                Project Not Found
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
                                The project you're looking for doesn't exist or has been removed.
                            </p>
                            <Link href="/projects" className="inline-block">
                                <Button
                                    leftSection={<MdArrowBack />}
                                    color="brandOrange"
                                    size="lg"
                                >
                                    Back to Projects
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </Layout1>
        );
    }

    return (
        <Layout1>
            <div className="min-h-screen custom-black-white-theme-switch-bg">
                {/* Hero Section */}
                <section className="relative py-16 lg:py-24 overflow-hidden bg-gradient-to-br from-[var(--bg-general-lighter)] to-orange-50 dark:from-gray-800 dark:to-gray-900">
                    <div className="page-container">
                        <Link href="/projects" className="inline-block mb-8">
                            <Button
                                variant="subtle"
                                leftSection={<MdArrowBack />}
                            >
                                Back to Projects
                            </Button>
                        </Link>

                        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                            <div>
                                <div className="inline-block px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full border border-[var(--bg-general)]/20 mb-6">
                                    <span className="text-sm font-semibold text-[var(--bg-general)]">{project.category}</span>
                                </div>
                                <h1 className="text-4xl lg:text-5xl font-bold custom-black-white-theme-switch-text mb-6 leading-tight">
                                    {project.title}
                                </h1>
                                <p className="text-xl  custom-black-white-theme-switch-text leading-relaxed mb-8">
                                    {project.description}
                                </p>
                                
                                {(project.client || project.location) && (
                                    <div className="flex flex-wrap gap-6 mb-8">
                                        {project.client && (
                                            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                                <MdBusiness size={20} className="text-[var(--bg-general)]" />
                                                <div>
                                                    <p className="text-xs custom-black-white-theme-switch-text uppercase tracking-wide">Client</p>
                                                    <p className="font-semibold">{project.client}</p>
                                                </div>
                                            </div>
                                        )}
                                        {project.location && (
                                            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                                <MdLocationOn size={20} className="text-[var(--bg-general)]" />
                                                <div>
                                                    <p className="text-xs  custom-black-white-theme-switch-text uppercase tracking-wide">Location</p>
                                                    <p className="font-semibold">{project.location}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="flex flex-wrap gap-4">
                                    <Link href="/contact">
                                        <Button
                                            color="brandOrange"
                                            size="lg"
                                        >
                                            Get Similar Solution
                                        </Button>
                                    </Link>
                                    <Link href="/projects">
                                        <Button
                                            variant="outline"
                                            size="lg"
                                        >
                                            View All Projects
                                        </Button>
                                    </Link>
                                </div>
                            </div>

                            <div className="relative h-96 lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
                                <Image
                                    src={project.image}
                                    alt={project.title}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Main Content */}
                <section className="section-spacing">
                    <div className="page-container">
                        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
                            {/* Main Content */}
                            <div className="lg:col-span-2 space-y-8">
                                {project.fullDescription && (
                                    <div className="card">
                                        <h2 className="text-2xl font-bold custom-black-white-theme-switch-text mb-4">
                                            Project Overview
                                        </h2>
                                        <div className="prose prose-lg max-w-none custom-black-white-theme-switch-text leading-relaxed">
                                            <p className="whitespace-pre-line">{project.fullDescription}</p>
                                        </div>
                                    </div>
                                )}

                                {project.technologies && project.technologies.length > 0 && (
                                    <div className="card">
                                        <h2 className="text-2xl font-bold custom-black-white-theme-switch-text mb-6">
                                            Technologies & Solutions
                                        </h2>
                                        <ul className="space-y-3">
                                            {project.technologies.map((tech, index) => (
                                                <li key={index} className="flex items-start gap-3">
                                                    <div className="flex-shrink-0 w-2 h-2 bg-[var(--bg-general)] rounded-full mt-2" />
                                                    <span className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                                                        {tech}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {project.results && project.results.length > 0 && (
                                    <div className="card">
                                        <h2 className="text-2xl font-bold custom-black-white-theme-switch-text mb-6">
                                            Results & Achievements
                                        </h2>
                                        <ul className="space-y-3">
                                            {project.results.map((result, index) => (
                                                <li key={index} className="flex items-start gap-3">
                                                    <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2" />
                                                    <span className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                                                        {result}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {project.images && project.images.length > 0 && (
                                    <div className="card">
                                        <h2 className="text-2xl font-bold custom-black-white-theme-switch-text mb-6">
                                            Project Gallery
                                        </h2>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {project.images.map((img, index) => (
                                                <div key={index} className="relative h-48 rounded-xl overflow-hidden group cursor-pointer">
                                                    <Image
                                                        src={img}
                                                        alt={`${project.title} ${index + 1}`}
                                                        fill
                                                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Sidebar */}
                            <div className="space-y-6">
                                <div className="card bg-gradient-to-br from-[var(--bg-general)] to-orange-600 text-white">
                                    <h3 className="text-xl font-bold mb-4">Interested in Similar Work?</h3>
                                    <p className="text-orange-50 mb-6 leading-relaxed">
                                        Let's discuss how we can help bring your vision to life.
                                    </p>
                                    <Link href="/contact" className="block w-full">
                                        <Button
                                            variant="light"
                                            color="brandOrange"
                                            size="md"
                                            fullWidth
                                            className=" bg-white hover:bg-gray-100"
                                        >
                                            Get in Touch
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </Layout1>
    );
}







