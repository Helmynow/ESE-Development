import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 1,
  iterations: 1,
  thresholds: {
    http_req_duration: ['p(95)<3000'],
  },
};

export default function smoke() {
  const res = http.get('https://example.com');
  check(res, {
    'status is 200': (r) => r.status === 200,
  });
  sleep(1);
}
