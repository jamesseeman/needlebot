export async function load({ fetch }) {
  const albums = await (await fetch("/api/albums")).json();

  return {
    albums,
  };
}
