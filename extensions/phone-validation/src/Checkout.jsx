import '@shopify/ui-extensions/preact';
import {render} from 'preact';
import {useRef} from 'preact/hooks';
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

  // Strip non-digits so pasted/autofilled formats are handled consistently.
  let digitsOnly = rawPhone.replace(/\D/g, '');

  // Allow US/Canada (+1) and India (+91) country-code prefixes.
  if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
    digitsOnly = digitsOnly.slice(2);
  } else if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
    return digitsOnly.slice(1);
  }

  return digitsOnly;
}

function isPhoneValid(rawPhone) {
  // const normalizedPhone = normalizePhone(rawPhone);
  // console.log('normalizedPhone', normalizedPhone);
  const normalizedPhone = rawPhone;
  return normalizedPhone.length === 10 && !normalizedPhone.startsWith('0') && !normalizedPhone.startsWith('+');
}

function Extension() {

  const shippingAddress = useShippingAddress();
  const latestPhoneRef = useRef(shippingAddress?.phone ?? '');
  latestPhoneRef.current = shippingAddress?.phone ?? '';


  useBuyerJourneyIntercept(({canBlockProgress}) => {
    const isValid = isPhoneValid(latestPhoneRef.current);

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
