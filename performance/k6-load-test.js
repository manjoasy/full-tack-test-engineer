import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('error_rate');
const responseTime = new Trend('response_time');

// Test configuration: simulate 500 concurrent requests
export const options = {
  scenarios: {
    spike_test: {
      executor: 'shared-iterations',
      vus: 500,
      iterations: 500,
      maxDuration: '60s',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<5000'], // 95% of requests should be under 5s
    error_rate: ['rate<0.1'], // Error rate should be under 10%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';

// Get auth token before test
export function setup() {
  const loginRes = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
    username: 'admin',
    password: 'admin123',
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

  const body = JSON.parse(loginRes.body);
  return { token: body.data.token };
}

export default function (data) {
  const uniqueId = `${__VU}-${__ITER}-${Date.now()}`;

  const payload = JSON.stringify({
    firstName: `Candidat`,
    lastName: `Test-${uniqueId}`,
    email: `candidate-${uniqueId}@loadtest.com`,
    phone: '+33612345678',
    position: 'Développeur Test',
    experience: 3,
    skills: ['JavaScript', 'TypeScript'],
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${data.token}`,
    },
  };

  const res = http.post(`${BASE_URL}/api/candidates`, payload, params);

  // Track metrics
  responseTime.add(res.timings.duration);
  errorRate.add(res.status !== 201 && res.status !== 429);

  // Assertions
  check(res, {
    'status is 201 or 429 (rate limited)': (r) => r.status === 201 || r.status === 429,
    'response time < 5000ms': (r) => r.timings.duration < 5000,
    'has response body': (r) => r.body !== null,
  });

  sleep(0.1);
}

export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'performance/k6-report.json': JSON.stringify(data, null, 2),
  };
}

function textSummary(data, opts) {
  // k6 provides a built-in text summary
  return '';
}
