"use client";

import Layout1 from '@/components/layout/Layout1';
import { Title, Text, Container, TextInput, Textarea, Select, Button, Paper } from '@mantine/core';
import { useForm, Controller } from 'react-hook-form';
import { api } from '@/api/axios';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { IssueType } from '@/lib/enums/issueType.enum';
import CustomLoader from '@/components/features/CustomLoader';

export default function ReportIssuePage() {
    const params = useParams();
    const router = useRouter();
    const parcelId = params.id as string;
    const [loading, setLoading] = useState(false);
    const [parcel, setParcel] = useState<any>(null);

    const { register, handleSubmit, formState: { errors }, control } = useForm({
        defaultValues: {
            type: IssueType.OTHER,
            priority: 'MEDIUM',
            title: '',
            description: '',
        },
    });

    useEffect(() => {
        const fetchParcel = async () => {
            try {
                const res = await api.get(`/parcel/${parcelId}`);
                setParcel(res.data.parcel);
            } catch (error) {
                toast.error('Failed to load parcel information');
                router.push('/tracking');
            }
        };
        if (parcelId) fetchParcel();
    }, [parcelId, router]);

    const onSubmit = async (data: any) => {
        setLoading(true);
        try {
            await api.post('/issue', {
                parcelId,
                ...data,
                reportedBy: parcel?.sender?.email || 'Customer',
            });
            toast.success('Issue reported successfully! Our team will review it shortly.');
            router.push(`/tracking?trackingId=${parcel?.trackingId}`);
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to report issue');
        } finally {
            setLoading(false);
        }
    };

    if (!parcel) {
        return (
            <Layout1>
                <Container size="md" className="py-16">
                    <CustomLoader loading={true} />
                </Container>
            </Layout1>
        );
    }

    return (
        <Layout1>
            <Container size="md" className="py-16">
                <Title order={1} className="mb-2">Report an Issue</Title>
                <Text c="dimmed" className="mb-8">
                    Tracking ID: <strong>{parcel.trackingId}</strong>
                </Text>

                <Paper shadow="sm" p="xl" radius="md" withBorder>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <Controller
                            name="type"
                            control={control}
                            rules={{ required: true }}
                            render={({ field }) => (
                                <Select
                                    label="Issue Type"
                                    data={Object.values(IssueType).map(t => ({ value: t, label: t.replace(/_/g, ' ') }))}
                                    value={field.value}
                                    onChange={field.onChange}
                                    error={errors.type?.message as string}
                                />
                            )}
                        />

                        <Controller
                            name="priority"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    label="Priority"
                                    data={[
                                        { value: 'LOW', label: 'Low' },
                                        { value: 'MEDIUM', label: 'Medium' },
                                        { value: 'HIGH', label: 'High' },
                                        { value: 'URGENT', label: 'Urgent' },
                                    ]}
                                    value={field.value}
                                    onChange={field.onChange}
                                />
                            )}
                        />

                        <TextInput
                            label="Title"
                            placeholder="Brief description of the issue"
                            required
                            {...register('title', { required: 'Title is required' })}
                            error={errors.title?.message as string}
                        />

                        <Textarea
                            label="Description"
                            placeholder="Please provide detailed information about the issue..."
                            rows={8}
                            required
                            {...register('description', { required: 'Description is required' })}
                            error={errors.description?.message as string}
                        />

                        <div className="flex gap-4">
                            <Button
                                type="submit"
                                color="brandOrange"
                                size="lg"
                                loading={loading}
                                fullWidth
                            >
                                Submit Issue
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={() => router.back()}
                                fullWidth
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </Paper>
            </Container>
        </Layout1>
    );
}



