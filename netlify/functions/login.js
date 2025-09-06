export async function handler(event, context) {
  try {
    console.log('event.body:', event.body); // log để xem body nhận được

    const body = JSON.parse(event.body);
    const response = await fetch('https://chatplatform3-11.onrender.com/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    return {
      statusCode: response.status,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    };
  } catch (err) {
    console.error(err); // log lỗi chi tiết
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
}
