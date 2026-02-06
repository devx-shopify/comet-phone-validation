import '@shopify/ui-extensions/preact';
import {render} from 'preact';
import {
  useBuyerJourneyIntercept,
  useShippingAddress,
} from '@shopify/ui-extensions/checkout/preact';

export default async () => {
  render(<Extension />, document.body);
};

const PHONE_ERROR_MESSAGE = 'Phone number must be 10 digits.';

function normalizePhone(rawPhone) {
  if (!rawPhone) return '';
  const digitsOnly = rawPhone.replace(/\D/g, '');
  if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
    return digitsOnly.slice(1);
  }
  return digitsOnly;
}

function isPhoneValid(rawPhone) {
  const normalizedPhone = normalizePhone(rawPhone);
  return normalizedPhone.length === 10 && !normalizedPhone.startsWith('0');
}

function Extension() {
  const shippingAddress = useShippingAddress();
  const rawPhone = shippingAddress?.phone ?? '';
  const isValid = isPhoneValid(rawPhone);

  useBuyerJourneyIntercept(({canBlockProgress}) => {
    if (!canBlockProgress || isValid) {
      return {behavior: 'allow'};
    }

    return {
      behavior: 'block',
      reason: 'Invalid phone number length',
      errors: [
        {
          message: PHONE_ERROR_MESSAGE,
          target: '$.cart.deliveryGroups[0].deliveryAddress.phone',
        },
      ],
    };
  });

  return null;
}
