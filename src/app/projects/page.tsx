"use client";

import Layout1 from '@/components/layout/Layout1';
import { Title, Text, Container, SimpleGrid, Card, Button, Badge } from '@mantine/core';
import { api } from '@/api/axios';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MdArrowForward } from 'react-icons/md';
import CustomLoader from '@/components/features/CustomLoader';

type Project = {
    _id: string;
    title: string;
    slug: string;
    description: string;
    category: string;
    image: string;
    client?: string;
};

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await api.get('/project?active=true');
                setProjects(res.data.projects || []);
            } catch (error) {
                console.error('Failed to load projects');
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, []);

    return (
        <Layout1>
            <Container size="xl" className="py-16">
                <div className="text-center mb-12">
                    <Title order={1} className="mb-4">Our Projects & Portfolio</Title>
                    <Text c="dimmed" size="lg">Explore our successful logistics solutions and case studies</Text>
                </div>

                {loading ? (
                    <div className="text-center py-20">
                        <CustomLoader loading={true} />
                    </div>
                ) : (
                    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
                        {projects.map((project) => (
                            <Card key={project._id} shadow="sm" padding="lg" radius="md" withBorder className="hover:shadow-lg transition-shadow">
                                <div className="mb-4 h-48 bg-gray-200 rounded-lg overflow-hidden">
                                    <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
                                </div>
                                <Badge color="brandOrange" variant="light" className="mb-3">{project.category}</Badge>
                                <Title order={3} className="mb-2">{project.title}</Title>
                                <Text c="dimmed" size="sm" className="mb-4" lineClamp={3}>
                                    {project.description}
                                </Text>
                                {project.client && (
                                    <Text size="xs" c="dimmed" className="mb-4">Client: {project.client}</Text>
                                )}
                                <Button
                                    component={Link}
                                    href={`/projects/${project.slug}`}
                                    rightSection={<MdArrowForward />}
                                    color="brandOrange"
                                    variant="light"
                                    fullWidth
                                >
                                    View Case Study
                                </Button>
                            </Card>
                        ))}
                    </SimpleGrid>
                )}

                {projects.length === 0 && !loading && (
                    <div className="text-center py-20">
                        <Text c="dimmed">No projects available at the moment.</Text>
                    </div>
                )}
            </Container>
        </Layout1>
    );
}







