export async function load({ fetch }) {
  const albums = await (await fetch("/albums")).json();

  return {
    albums,
  };
}
