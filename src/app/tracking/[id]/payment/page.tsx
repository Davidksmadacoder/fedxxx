"use client";

import Layout1 from '@/components/layout/Layout1';
import { Title, Text, Container, Paper, Button, SimpleGrid, Select, TextInput, Badge } from '@mantine/core';
import { api } from '@/api/axios';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import CustomLoader from '@/components/features/CustomLoader';

export default function PaymentPage() {
    const params = useParams();
    const router = useRouter();
    const parcelId = params.id as string;
    const [loading, setLoading] = useState(false);
    const [parcel, setParcel] = useState<any>(null);
    const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
    const [selectedMethod, setSelectedMethod] = useState<string>('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [parcelRes, pmRes] = await Promise.all([
                    api.get(`/parcel/${parcelId}`),
                    api.get('/paymentMethod?active=true'),
                ]);
                setParcel(parcelRes.data.parcel);
                setPaymentMethods(pmRes.data.paymentMethods || []);
                if (pmRes.data.paymentMethods?.length > 0) {
                    const defaultMethod = pmRes.data.paymentMethods.find((pm: any) => pm.isDefault);
                    setSelectedMethod(defaultMethod?._id || pmRes.data.paymentMethods[0]._id);
                }
            } catch (error) {
                toast.error('Failed to load payment information');
                router.push('/tracking');
            }
        };
        if (parcelId) fetchData();
    }, [parcelId, router]);

    const handlePayment = async () => {
        if (!selectedMethod || !parcel) return;
        setLoading(true);
        try {
            await api.post('/payment', {
                parcelId,
                paymentMethodId: selectedMethod,
                amount: parcel.totalAmount || parcel.calculatedPrice || 0,
                currency: parcel.currency || 'USD',
                description: `Payment for shipment ${parcel.trackingId}`,
            });
            toast.success('Payment initiated successfully!');
            router.push(`/tracking?trackingId=${parcel.trackingId}`);
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to process payment');
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

    const amount = parcel.totalAmount || parcel.calculatedPrice || 0;
    const currency = parcel.currency || 'USD';

    return (
        <Layout1>
            <Container size="md" className="py-16">
                <Title order={1} className="mb-2">Make Payment</Title>
                <Text c="dimmed" className="mb-8">
                    Tracking ID: <strong>{parcel.trackingId}</strong>
                </Text>

                <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
                    <Paper shadow="sm" p="xl" radius="md" withBorder>
                        <Title order={3} className="mb-4">Payment Summary</Title>
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <Text c="dimmed">Base Price</Text>
                                <Text fw={600}>{currency} {(parcel.basePrice || amount).toFixed(2)}</Text>
                            </div>
                            {parcel.additionalFees > 0 && (
                                <div className="flex justify-between">
                                    <Text c="dimmed">Additional Fees</Text>
                                    <Text fw={600}>{currency} {parcel.additionalFees.toFixed(2)}</Text>
                                </div>
                            )}
                            {parcel.discount > 0 && (
                                <div className="flex justify-between">
                                    <Text c="dimmed">Discount</Text>
                                    <Text fw={600} c="green">-{currency} {parcel.discount.toFixed(2)}</Text>
                                </div>
                            )}
                            <div className="pt-4 border-t">
                                <div className="flex justify-between">
                                    <Text fw={700} size="lg">Total Amount</Text>
                                    <Text fw={700} size="xl" c="brandOrange">
                                        {currency} {amount.toFixed(2)}
                                    </Text>
                                </div>
                            </div>
                        </div>
                    </Paper>

                    <Paper shadow="sm" p="xl" radius="md" withBorder>
                        <Title order={3} className="mb-4">Select Payment Method</Title>
                        {paymentMethods.length === 0 ? (
                            <Text c="dimmed">No payment methods available</Text>
                        ) : (
                            <>
                                <Select
                                    label="Payment Method"
                                    data={paymentMethods.map(pm => ({
                                        value: pm._id,
                                        label: `${pm.type}${pm.isDefault ? ' (Default)' : ''}`,
                                    }))}
                                    value={selectedMethod}
                                    onChange={(value) => setSelectedMethod(value || '')}
                                    className="mb-4"
                                />
                                {selectedMethod && (
                                    <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        {(() => {
                                            const method = paymentMethods.find(pm => pm._id === selectedMethod);
                                            if (!method) return null;
                                            return (
                                                <div>
                                                    <Text fw={600} className="mb-2">{method.type}</Text>
                                                    <Text size="sm" c="dimmed">
                                                        Processing Time: {method.processingTime}
                                                    </Text>
                                                    {method.fee > 0 && (
                                                        <Text size="sm" c="dimmed">
                                                            Fee: {currency} {method.fee.toFixed(2)}
                                                        </Text>
                                                    )}
                                                </div>
                                            );
                                        })()}
                                    </div>
                                )}
                                <Button
                                    fullWidth
                                    size="lg"
                                    color="brandOrange"
                                    onClick={handlePayment}
                                    loading={loading}
                                    disabled={!selectedMethod}
                                >
                                    Proceed to Payment
                                </Button>
                            </>
                        )}
                    </Paper>
                </SimpleGrid>
            </Container>
        </Layout1>
    );
}







