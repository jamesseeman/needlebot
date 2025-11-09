<script lang="ts">
  import { ArrowRight, Disc3, X } from "lucide-svelte";
  import discogsLogo from "$lib/assets/discogs.png";

  interface Props {
    showModal: boolean;
    onClose: () => void;
  }

  let { showModal = $bindable(), onClose }: Props = $props();

  let submitting = $state<boolean>(false);
  let predictions = $state([]);

  function removePrediction(index: number) {
    predictions = predictions.filter((_, i) => i !== index);
  }

  function getConditionStyle(condition: string) {
    const conditionMap: Record<string, string> = {
      Mint: "bg-green-100 text-green-800",
      "Near Mint": "bg-green-50 text-green-700",
      "Very Good": "bg-blue-100 text-blue-800",
      Good: "bg-yellow-100 text-yellow-800",
      Fair: "bg-orange-100 text-orange-800",
      Poor: "bg-red-100 text-red-800",
    };
    return conditionMap[condition] || "bg-gray-200 text-gray-800";
  }

  async function handleFileUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    const files = target.files;

    if (files && files.length > 0) {
      Array.from(files).forEach(async (file) => {
        const uploadImage = URL.createObjectURL(file);
        const predictionIndex = predictions.length;
        predictions.push({ loading: true, uploadImage });

        try {
          const formData = new FormData();
          formData.append("image", file);

          const predictionResponse = await fetch("/api/predict", {
            method: "POST",
            body: formData,
          });

          if (!predictionResponse.ok) {
            const errorData = await predictionResponse.json().catch(() => ({}));
            const errorMessage =
              errorData.error || predictionResponse.statusText;
            throw new Error(`Failed to analyze image: ${errorMessage}`);
          }

          const predictionData = await predictionResponse.json();
          let responseText = predictionData.content[0].text;

          // Strip markdown code blocks if present
          responseText = responseText
            .replace(/```json\n?/g, "")
            .replace(/```\n?/g, "")
            .trim();

          const recordData = JSON.parse(responseText);

          const searchResponse = await fetch("/api/search", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(recordData),
          });

          if (!searchResponse.ok) {
            const errorData = await searchResponse.json().catch(() => ({}));
            const errorMessage = errorData.error || searchResponse.statusText;
            console.error(`Failed to search Discogs: ${errorMessage}`);

            predictions[predictionIndex] = {
              ...recordData,
              uploadImage,
              loading: false,
              error: errorMessage,
            };
            return;
          }

          const searchResult = await searchResponse.json();
          predictions[predictionIndex] = {
            ...recordData,
            ...searchResult,
            uploadImage,
            loading: false,
          };
        } catch (error) {
          console.error("Error processing file upload:", error);
          predictions[predictionIndex] = {
            uploadImage,
            loading: false,
            error:
              error instanceof Error ? error.message : "Unknown error occurred",
          };
        }
      });
    }
  }

  async function handleSubmit() {
    submitting = true;

    // Submit each album separately
    for (let i = 0; i < predictions.length; i++) {
      const prediction = predictions[i];

      try {
        // Convert blob URL to base64
        const response = await fetch(prediction.uploadImage);
        const blob = await response.blob();

        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });

        const predictionWithBase64 = { ...prediction, uploadImage: base64 };

        // Submit individual album
        const submitResponse = await fetch("/api/albums", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify([predictionWithBase64]),
        });

        if (!submitResponse.ok) {
          const errorData = await submitResponse.json().catch(() => ({}));
          const errorMessage = errorData.error || submitResponse.statusText;
          throw new Error(`Failed to save album: ${errorMessage}`);
        }
      } catch (error) {
        console.error(`Error submitting album ${i + 1}:`, error);
        // Continue with next album even if one fails
        alert(
          `Failed to save album ${i + 1}: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }

    submitting = false;
    predictions = [];
    onClose();
  }
</script>

{#if showModal}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="fixed text-black inset-0 bg-black/60 flex items-center justify-center z-50"
    onclick={onClose}
  >
    <div
      class="bg-white rounded-lg shadow-2xl p-6 overflow-y-auto max-w-4xl w-full max-h-1/2 h-full mx-4"
      onclick={(e) => e.stopPropagation()}
    >
      <div class="space-y-4">
        <label
          class="flex items-center justify-center bg-gray-300 w-2/5 rounded py-3 mx-auto"
        >
          <span class="flex items-center justify-center gap-2 text-xl"
            ><Disc3 /> Upload albums here</span
          >
          <input
            hidden
            type="file"
            onchange={handleFileUpload}
            multiple
            accept="image/*"
            class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </label>

        {#each predictions as prediction, i (i)}
          {@render predictionCard(prediction, i)}
        {/each}

        <button
          disabled={predictions.length == 0}
          onclick={handleSubmit}
          class="block text-xl justify-center items-center gap-2 w-4/5 mx-auto bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:bg-gray-400"
        >
          <p>Submit</p>
          {#if submitting}
            <div
              class="animate-spin h-4 w-4 rounded-full border-3 border-solid border-current border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite"
            ></div>
          {/if}
        </button>
      </div>
    </div>
  </div>
{/if}

{#snippet predictionCard(prediction, index)}
  <div
    class="mt-4 p-5 rounded border border-gray-200 shadow-md relative flex flex-row items-start gap-4"
  >
    <button
      onclick={() => removePrediction(index)}
      class="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-200 transition-colors"
      aria-label="Remove prediction"
    >
      <X size={20} class="text-gray-600" />
    </button>

    <img
      src={prediction.uploadImage}
      alt="Uploaded preview"
      class="h-40 w-auto object-contain"
    />

    {#if !prediction.loading}
      {#if prediction.error}
        <div class="flex items-center justify-center flex-1 self-center">
          <div class="text-center text-red-600">
            <p class="font-semibold">Error</p>
            <p class="text-sm">{prediction.error}</p>
          </div>
        </div>
      {:else}
        <ArrowRight class="text-gray-700 self-center" size={48} />

        <img src={prediction.cover_image} class="h-40 w-auto object-contain" />
        <div class="w-full h-40 flex flex-col">
          <a
            class="text-xl font-bold truncate flex flex-row items-center gap-2 hover:underline"
            href="https://discogs.com{prediction.uri}"
            target="_blank"
            ><img src={discogsLogo} class="w-5" alt="Discogs" />
            {prediction.album}</a
          >

          <h2 class="text-gray-600 truncate">{prediction.artist}</h2>
          <h3 class="text-sm text-gray-500">{prediction.year}</h3>
          <p class=" text-xs text-gray-400 mt-1">{prediction.genre}</p>
          <div class="flex flex-row gap-4 justify-end items-center mt-auto">
            <span
              class="inline-block px-3 py-1 text-lg font-medium rounded-full {getConditionStyle(
                prediction.condition
              )}">{prediction.condition}</span
            >
            <h1 class="text-gray-600 text-lg truncate">
              ${prediction.price.toFixed(2)}
            </h1>
          </div>
        </div>
      {/if}
    {:else}
      <div class="flex items-center justify-center flex-1 self-center">
        <div
          class="animate-spin rounded-full h-12 w-12 border-6 border-solid border-current border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite] text-gray-500"
        ></div>
      </div>
    {/if}
  </div>
{/snippet}
