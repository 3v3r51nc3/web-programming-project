from django.db import migrations, models


def convert_pending_registrations(apps, schema_editor):
    Registration = apps.get_model("api", "Registration")
    Registration.objects.filter(status="pending").update(status="confirmed")


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0002_event_creator_event_visibility_and_more"),
    ]

    operations = [
        migrations.RunPython(convert_pending_registrations, migrations.RunPython.noop),
        migrations.RemoveField(
            model_name="event",
            name="creator",
        ),
        migrations.RemoveField(
            model_name="event",
            name="visibility",
        ),
        migrations.AlterField(
            model_name="registration",
            name="status",
            field=models.CharField(
                choices=[("confirmed", "Confirmed"), ("cancelled", "Cancelled")],
                default="confirmed",
                max_length=20,
            ),
        ),
    ]
